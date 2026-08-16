import React from 'react';
import { Sparkles, FileCode2 } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { openPasteModal } from '../../store/slices/aiSlice';
import { DocumentUploader } from './DocumentUploader';
import { PasteTextModal } from './PasteTextModal';
import { ExtractionProgress } from './ExtractionProgress';
import { AIExtractionSummary } from './AIExtractionSummary';
import { RiskAssessmentCard } from './RiskAssessmentCard';
import { AIRecommendations } from './AIRecommendations';
import { CompletenessChecker } from './CompletenessChecker';
import { DuplicateDetection } from './DuplicateDetection';
import { AIChat } from './AIChat';

export const AIIntakeAssistant: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <div className="space-y-4">
      {/* Header Badge & Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              AI Complaint Intake Assistant
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Upload documents or chat to auto-populate complaint fields
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
          BETA
        </span>
      </div>

      {/* Document Upload Area */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <DocumentUploader />

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            OR
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        <button
          type="button"
          onClick={() => dispatch(openPasteModal())}
          className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <FileCode2 className="w-4 h-4 text-blue-600" />
          <span>Paste Complaint Text / Email</span>
        </button>
      </div>

      {/* Extraction Progress */}
      <ExtractionProgress />

      {/* Extraction Summary */}
      <AIExtractionSummary />

      {/* Risk Assessment Card */}
      <RiskAssessmentCard />

      {/* Recommendations */}
      <AIRecommendations />

      {/* Completeness Checker */}
      <CompletenessChecker />

      {/* Duplicate Detection */}
      <DuplicateDetection />

      {/* AI Chat Copilot */}
      <AIChat />

      {/* Paste Modal */}
      <PasteTextModal />
    </div>
  );
};
