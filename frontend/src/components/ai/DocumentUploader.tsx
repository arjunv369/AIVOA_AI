import React, { useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setSelectedFile,
  setExtractionStatus,
  setExtractionProgress,
  completeExtraction,
} from '../../store/slices/aiSlice';
import { populateFromAILog } from '../../store/slices/complaintSlice';
import { extractDocumentAi } from '../../services/documentApi';

export const DocumentUploader: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedFileName, selectedFileType, selectedFileSize, extractionStatus } = useAppSelector(
    (state) => state.ai
  );

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
    dispatch(setExtractionProgress({ progress: 10, message: 'Reading uploaded document...' }));

    setTimeout(() => {
      dispatch(setExtractionProgress({ progress: 50, message: 'Parsing pharmaceutical entities...' }));
    }, 400);

    const docResult = await extractDocumentAi(file);

    setTimeout(() => {
      dispatch(completeExtraction({ extractedData: docResult.extractedData }));
      dispatch(
  populateFromAILog({
    ...docResult.extractedData,
    quantity_affected:
      docResult.extractedData.quantity_affected === undefined ||
      docResult.extractedData.quantity_affected === ""
        ? undefined
        : Number(docResult.extractedData.quantity_affected),
  }),
);
    }, 900);
  };

  const handleRemoveFile = () => {
    dispatch(setSelectedFile(null));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.eml"
        onChange={handleFileChange}
        className="hidden"
      />

      {!selectedFileName ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-50/70 hover:bg-blue-50/30 group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            Drag & drop complaint document here
          </p>
          <p className="text-xs text-blue-600 font-medium hover:underline mt-0.5">
            or click to browse
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-600">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Supported: PDF, DOCX, TXT, EML • Max: 10 MB</span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">
                {selectedFileName}
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                {selectedFileType} • {selectedFileSize}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemoveFile}
            disabled={extractionStatus === 'analyzing'}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
            title="Remove document"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
