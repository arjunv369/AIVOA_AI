import React, { useState, useRef } from 'react';
import { Send, Bot, User, Paperclip } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  completeExtraction,
  sendChatMessage,
  setSelectedFile,
  setExtractionStatus,
  setExtractionProgress,
} from '../../store/slices/aiSlice';
import { editFromAI, populateFromAILog } from '../../store/slices/complaintSlice';
import { logComplaintAi, editComplaintAi } from '../../services/aiApi';
import { extractDocumentAi } from '../../services/documentApi';

export const AIChat: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');
  const { chatMessages } = useAppSelector((state) => state.ai);
  const { formData } = useAppSelector((state) => state.complaint);

  const suggestedQuestions = [
    'What information is missing?',
    'Why was this classified as Major?',
    'What are the potential risks?',
    'Summarize this complaint.',
    'What should I verify before saving?',
  ];

  const normalizeComplaintPayload = (data: any) => {
    if (!data || typeof data !== 'object') return data;

    const parsedQuantity =
      typeof data.quantity_affected === 'string'
        ? Number(data.quantity_affected)
        : data.quantity_affected;

    return {
      ...data,
      quantity_affected:
        typeof parsedQuantity === 'number' && Number.isNaN(parsedQuantity)
          ? undefined
          : parsedQuantity,
    };
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    dispatch(sendChatMessage(query));
    if (!textToSend) setInputText('');

    const lower = query.toLowerCase();
    const isEdit =
      Boolean(formData.customer_name || formData.product_name) &&
      (lower.startsWith('sorry') ||
        lower.startsWith('update') ||
        lower.includes('batch number is') ||
        lower.includes('batch is') ||
        lower.includes('quantity is') ||
        lower.includes('change') ||
        lower.includes('correct'));

    if (isEdit) {
      const editResult = await editComplaintAi(query, formData);
      dispatch(
        editFromAI(
          normalizeComplaintPayload(editResult.changed_fields || editResult.extracted_data)
        )
      );
      dispatch(
        completeExtraction({
          extractedData: editResult.extracted_data,
          riskAssessment: editResult.risk_assessment,
          completeness: editResult.completeness,
          duplicateMatch: editResult.duplicate_match,
          explanation: editResult.explanation,
        })
      );
    } else if (
      lower.includes('reported') ||
      lower.includes('complaint') ||
      lower.includes('damaged') ||
      lower.includes('discolored') ||
      lower.includes('contamination') ||
      lower.includes('defect') ||
      lower.includes('capsules') ||
      lower.includes('tablets')
    ) {
      const logResult = await logComplaintAi(query, formData);
      dispatch(populateFromAILog(normalizeComplaintPayload(logResult.extracted_data)));
      dispatch(
        completeExtraction({
          extractedData: logResult.extracted_data,
          riskAssessment: logResult.risk_assessment,
          completeness: logResult.completeness,
          duplicateMatch: logResult.duplicate_match,
          explanation: logResult.explanation,
        })
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

    dispatch(
      setSelectedFile({
        fileName: file.name,
        fileType: ext,
        fileSize: `${sizeInMb} MB`,
      })
    );

    dispatch(setExtractionStatus('analyzing'));
    dispatch(setExtractionProgress({ progress: 15, message: 'Reading uploaded document...' }));

    setTimeout(() => {
      dispatch(setExtractionProgress({ progress: 60, message: 'Extracting complaint details...' }));
    }, 400);

    const docResult = await extractDocumentAi(file);
    setTimeout(() => {
      dispatch(
        completeExtraction({
          extractedData: docResult.extractedData,
          riskAssessment: docResult.riskAssessment,
          completeness: docResult.completeness,
          duplicateMatch: docResult.duplicateMatch,
          explanation: docResult.explanation,
        })
      );
      dispatch(populateFromAILog(normalizeComplaintPayload(docResult.extractedData)));
    }, 900);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col h-[460px] relative">
      {/* Hidden File Input for Paperclip */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.eml"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="border-b border-slate-100 pb-3 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-none">
              AIVOA Copilot
            </h3>
            <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
              Drop complaint files or paste text below.
            </p>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3.5 rounded-xl max-w-[88%] whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-indigo-50/60 border border-indigo-100 text-slate-800 rounded-tl-none font-medium leading-relaxed'
              }`}
            >
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Suggested Questions */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-medium whitespace-nowrap transition-colors border border-slate-200 shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Container */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <div className="flex items-center gap-2 bg-slate-50 border-2 border-indigo-500/80 rounded-xl p-1.5 shadow-xs">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Attach complaint file (PDF, DOCX, TXT, EML)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or paste a complaint..."
            className="flex-1 px-2 py-1 text-xs bg-transparent text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-40 shadow-xs"
            title="Send"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase text-center">
          POWERED BY LANGGRAPH
        </div>
      </div>
    </div>
  );
};
