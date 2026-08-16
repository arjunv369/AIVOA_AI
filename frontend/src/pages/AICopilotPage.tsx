import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AICopilotPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                AIVOA Copilot Intelligence Engine
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                LangGraph + Groq + FastAPI Orchestration Architecture
              </p>
            </div>
          </div>
          <Link
            to="/complaints/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs"
          >
            <span>Open Copilot Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 text-xs text-slate-700">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI Architecture & Tool Selection Pipeline</span>
          </div>

          <p className="leading-relaxed">
            AIVOA QMS utilizes a multi-tool agentic pipeline designed specifically for pharmaceutical quality assurance compliance. In production, requests flow securely through FastAPI to LangGraph tool selection agents:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <span className="font-bold text-blue-700 block">1. Log Complaint Tool</span>
              <p className="text-[11px] text-slate-600">
                Parses unstructured email narratives or phone intake text and populates structured complaint fields.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <span className="font-bold text-amber-700 block">2. Edit Complaint Tool</span>
              <p className="text-[11px] text-slate-600">
                Identifies field modification intents in natural language and performs non-destructive incremental state merges.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <span className="font-bold text-emerald-700 block">3. Document Extraction Tool</span>
              <p className="text-[11px] text-slate-600">
                Reads PDF, DOCX, TXT, and EML attachments to extract batch, grade, quantity, and manufacturing parameters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
