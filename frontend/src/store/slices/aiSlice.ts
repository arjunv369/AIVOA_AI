import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type {
  AIChatMessage,
  CompletenessData,
  DuplicateComplaintMatch,
  ExtractedComplaintData,
  ExtractionStatus,
  RiskAssessmentData,
} from '../../types/ai';

export interface AIState {
  // File upload state
  selectedFileName: string | null;
  selectedFileType: string | null;
  selectedFileSize: string | null;

  // Extraction workflow
  extractionStatus: ExtractionStatus;
  extractionProgress: number; // 0, 10, 25, 50, 75, 100
  extractionStepMessage: string;
  extractedData: ExtractedComplaintData | null;

  // Paste modal
  isPasteModalOpen: boolean;
  pastedText: string;

  // Analysis results
  riskAssessment: RiskAssessmentData | null;
  recommendations: string[];
  completeness: CompletenessData;
  duplicateDetection: DuplicateComplaintMatch | null;

  // AI Assistant Chat
  chatMessages: AIChatMessage[];
}

const initialRiskAssessment: RiskAssessmentData = {
  overallRisk: 'HIGH',
  severity: 'Major',
  priority: 'High',
  confidenceScore: 87,
  potentialImpact: 'Potential product quality issue affecting multiple units in batch PCM500-2026-07.',
};

const initialRecommendations: string[] = [
  'Verify the affected batch manufacturing and packaging records.',
  'Review retention sample quality for batch PCM500-2026-07.',
  'Confirm total quantity affected with distributor (ABC Pharma Distributors).',
  'Check whether similar complaints exist for Paracetamol 500 mg.',
  'Consider initiating a formal CAPA / QMS investigation.',
];

const initialCompleteness: CompletenessData = {
  percentage: 82,
  missingFields: ['Manufacturing Date', 'Quantity Affected'],
};

const initialDuplicate: DuplicateComplaintMatch = {
  complaintId: 'CMP-00124',
  customerName: 'ABC Pharma Distributors',
  productName: 'Paracetamol Tablets 500mg',
  similarityScore: 92,
  date: '2026-07-28',
  status: 'Under Investigation',
};

const initialChatMessages: AIChatMessage[] = [
  {
    id: '1',
    sender: 'assistant',
    content:
      'Ready to process new complaints. You can paste the raw email from the customer, or upload a PDF of the complaint report. I will extract the data and run the initial risk assessment.',
    timestamp: 'Just now',
    quickQuestions: [
      'What information is missing?',
      'Why was this classified as Major?',
      'What are the potential risks?',
      'Summarize this complaint.',
      'What should I verify before saving?',
    ],
  },
];

const initialState: AIState = {
  selectedFileName: null,
  selectedFileType: null,
  selectedFileSize: null,

  extractionStatus: 'idle',
  extractionProgress: 0,
  extractionStepMessage: 'Awaiting document or complaint text input...',
  extractedData: null,

  isPasteModalOpen: false,
  pastedText: '',

  riskAssessment: null,
  recommendations: [],
  completeness: { percentage: 0, missingFields: ['Customer Name', 'Detailed Complaint Description'] },
  duplicateDetection: null,

  chatMessages: initialChatMessages,
};

export const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setSelectedFile: (
      state,
      action: PayloadAction<{ fileName: string; fileType: string; fileSize: string } | null>
    ) => {
      if (action.payload) {
        state.selectedFileName = action.payload.fileName;
        state.selectedFileType = action.payload.fileType;
        state.selectedFileSize = action.payload.fileSize;
      } else {
        state.selectedFileName = null;
        state.selectedFileType = null;
        state.selectedFileSize = null;
      }
    },
    openPasteModal: (state) => {
      state.isPasteModalOpen = true;
    },
    closePasteModal: (state) => {
      state.isPasteModalOpen = false;
    },
    setPastedText: (state, action: PayloadAction<string>) => {
      state.pastedText = action.payload;
    },
    setExtractionStatus: (state, action: PayloadAction<ExtractionStatus>) => {
      state.extractionStatus = action.payload;
    },
    setExtractionProgress: (
      state,
      action: PayloadAction<{ progress: number; message: string }>
    ) => {
      state.extractionProgress = action.payload.progress;
      state.extractionStepMessage = action.payload.message;
    },
    completeExtraction: (
      state,
      action: PayloadAction<{
        extractedData: ExtractedComplaintData;
        riskAssessment?: RiskAssessmentData;
        completeness?: CompletenessData;
        duplicateMatch?: DuplicateComplaintMatch;
        explanation?: string;
      }>
    ) => {
      const { extractedData, riskAssessment, completeness, duplicateMatch, explanation } = action.payload;

      state.extractionStatus = 'completed';
      state.extractionProgress = 100;
      state.extractionStepMessage = 'Extraction completed.';
      state.extractedData = extractedData;
      state.riskAssessment = riskAssessment || initialRiskAssessment;
      state.recommendations = initialRecommendations;
      state.completeness = completeness || initialCompleteness;
      state.duplicateDetection = duplicateMatch || initialDuplicate;

      // Update Assistant Chat with response message
      if (explanation) {
        state.chatMessages.push({
          id: Date.now().toString(),
          sender: 'assistant',
          content: explanation,
          timestamp: 'Just now',
          quickQuestions: [
            'What information is missing?',
            'Why was this classified as Major?',
            'What are the potential risks?',
            'Summarize this complaint.',
            'What should I verify before saving?',
          ],
        });
      }
    },
    sendChatMessage: (state, action: PayloadAction<string>) => {
      const userText = action.payload;
      state.chatMessages.push({
        id: Date.now().toString(),
        sender: 'user',
        content: userText,
        timestamp: 'Just now',
      });
    },
    resetAIState: (state) => {
      state.selectedFileName = null;
      state.selectedFileType = null;
      state.selectedFileSize = null;
      state.extractionStatus = 'idle';
      state.extractionProgress = 0;
      state.extractionStepMessage = 'Awaiting document or complaint text input...';
      state.extractedData = null;
      state.isPasteModalOpen = false;
      state.pastedText = '';
      state.riskAssessment = null;
      state.recommendations = [];
      state.completeness = { percentage: 0, missingFields: ['Customer Name', 'Detailed Complaint Description'] };
      state.duplicateDetection = null;
      state.chatMessages = initialChatMessages;
    },
  },
});

export const {
  setSelectedFile,
  openPasteModal,
  closePasteModal,
  setPastedText,
  setExtractionStatus,
  setExtractionProgress,
  completeExtraction,
  sendChatMessage,
  resetAIState,
} = aiSlice.actions;

export default aiSlice.reducer;
