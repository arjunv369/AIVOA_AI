import React from 'react';
import { FileCode2, Sparkles, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  closePasteModal,
  completeExtraction,
  setExtractionProgress,
  setExtractionStatus,
  setPastedText,
} from '../../store/slices/aiSlice';
import { editFromAI, populateFromAILog } from '../../store/slices/complaintSlice';
import { parseCopilotMessage } from '../../utils/aiParser';

export const PasteTextModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isPasteModalOpen, pastedText, extractionStatus } = useAppSelector(
    (state) => state.ai
  );
  const { formData } = useAppSelector((state) => state.complaint);

  if (!isPasteModalOpen) return null;

  const handleAnalyze = () => {
    if (!pastedText.trim()) return;

    dispatch(closePasteModal());
    dispatch(setExtractionStatus('analyzing'));
    dispatch(
      setExtractionProgress({
        progress: 15,
        message: 'Analyzing pasted text narrative...',
      })
    );

    setTimeout(() => {
      dispatch(
        setExtractionProgress({
          progress: 60,
          message: 'Extracting product, batch, and severity details...',
        })
      );
    }, 400);

    setTimeout(() => {
      const result = parseCopilotMessage(pastedText, formData);

      if (result.toolType === 'EDIT_COMPLAINT') {
        dispatch(editFromAI(result.extractedData));
      } else {
        dispatch(populateFromAILog(result.extractedData));
      }

      dispatch(completeExtraction({ extractedData: result.extractedData }));
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Paste Complaint Text / Email
            </h3>
          </div>
          <button
            type="button"
            onClick={() => dispatch(closePasteModal())}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <textarea
          rows={6}
          value={pastedText}
          onChange={(e) => dispatch(setPastedText(e.target.value))}
          placeholder="Paste the customer complaint, email, or complaint narrative here..."
          className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 placeholder:italic resize-y"
        />

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Supported: Raw text, email threads, customer notes</span>
          <span>{pastedText.length} chars</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => dispatch(closePasteModal())}
            className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!pastedText.trim() || extractionStatus === 'analyzing'}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {extractionStatus === 'analyzing' ? 'Analyzing...' : 'Analyze Complaint'}
          </button>
        </div>
      </div>
    </div>
  );
};
