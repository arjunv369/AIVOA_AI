import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { FileText, Download, Eye } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const docs = [
    { name: 'complaint_abc_pharma.pdf', size: '1.2 MB', date: '2026-08-01', type: 'PDF' },
    { name: 'amoxicillin_discoloration_report.docx', size: '850 KB', date: '2026-08-05', type: 'DOCX' },
    { name: 'metformin_api_analysis_lot260712A.eml', size: '320 KB', date: '2026-08-07', type: 'EML' },
  ];

  return (
    <PageContainer>
      <div className="space-y-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Uploaded Complaint Documents
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Central repository of source customer complaint attachments and COA certificates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <div key={doc.name} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                  <p className="text-[11px] text-slate-500">{doc.type} • {doc.size}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
                <span>Uploaded: {doc.date}</span>
                <div className="flex items-center gap-2">
                  <button type="button" className="p-1 hover:text-blue-600" title="View"><Eye className="w-3.5 h-3.5" /></button>
                  <button type="button" className="p-1 hover:text-blue-600" title="Download"><Download className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};
