import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  chatWithCopilot,
  editComplaintAi,
  logComplaintAi,
} from "@/services/aiApi";
import type {
  AIChatMessage,
  AIMessage,
  CompletenessData,
  DuplicateMatch,
  ExtractedComplaintData,
  RiskAssessment,
} from "@/types/ai";
import type { ComplaintFormData } from "@/types/complaint";

interface SendCopilotPayload {
  question: string;
  currentState?: Partial<ComplaintFormData>;
}

interface AiState {
  messages: AIMessage[];
  chatPending: boolean;
  extractionStatus: "idle" | "uploading" | "analyzing" | "complete" | "completed" | "error";
  extractedData: ExtractedComplaintData;
  risk?: RiskAssessment;
  riskAssessment?: RiskAssessment;
  completeness?: CompletenessData;
  duplicateMatch?: DuplicateMatch;
  recommendations: string[];
  workflowStep: number;
  error: string | null;
}

const welcomeMessage: AIMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello. I can extract complaint information, assess risk, check completeness, identify possible duplicates, and suggest next steps.",
  quickQuestions: [
    "Extract the complaint details from this text.",
    "What is the risk level of this complaint?",
    "Which fields are still missing?",
  ],
};

const initialState: AiState = {
  messages: [welcomeMessage],
  chatPending: false,
  extractionStatus: "idle",
  extractedData: {},
  recommendations: [],
  workflowStep: 1,
  error: null,
};

export const sendCopilotMessage = createAsyncThunk(
  "ai/sendCopilotMessage",
  async (
    { question, currentState }: SendCopilotPayload,
    { rejectWithValue },
  ) => {
    try {
      return await chatWithCopilot({
        prompt: question,
        current_state: currentState,
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "AI request failed.",
      );
    }
  },
);

export const logComplaintWithAi = createAsyncThunk(
  "ai/logComplaintWithAi",
  async (
    { prompt, currentState }: { prompt: string; currentState?: Partial<ComplaintFormData> },
    { rejectWithValue },
  ) => {
    try {
      return await logComplaintAi({
        prompt,
        current_state: currentState,
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "AI extraction failed.",
      );
    }
  },
);

export const editComplaintWithAi = createAsyncThunk(
  "ai/editComplaintWithAi",
  async (
    { prompt, currentState }: { prompt: string; currentState?: Partial<ComplaintFormData> },
    { rejectWithValue },
  ) => {
    try {
      return await editComplaintAi({
        prompt,
        current_state: currentState,
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "AI edit failed.",
      );
    }
  },
);

const addAssistantMessage = (
  state: AiState,
  content: string,
  quickQuestions?: string[],
) => {
  state.messages.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role: "assistant",
    content,
    quickQuestions,
    timestamp: new Date().toISOString(),
  });
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    pushUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: `${Date.now()}-user`,
        role: "user",
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },

    setExtractionStatus: (
      state,
      action: PayloadAction<AiState["extractionStatus"]>,
    ) => {
      state.extractionStatus = action.payload;
    },

    completeExtraction: (
      state,
      action: PayloadAction<{
        extractedData: ExtractedComplaintData;
        riskAssessment?: RiskAssessment;
        completeness?: CompletenessData;
        duplicateMatch?: DuplicateMatch;
        explanation?: string;
      }>,
    ) => {
      state.extractedData = action.payload.extractedData;
      state.risk = action.payload.riskAssessment;
      state.riskAssessment = action.payload.riskAssessment;
      state.completeness = action.payload.completeness;
      state.duplicateMatch = action.payload.duplicateMatch;
      state.extractionStatus = "completed";

      if (action.payload.explanation) {
        addAssistantMessage(state, action.payload.explanation);
      }
    },

    populateFromAILog: (
      state,
      action: PayloadAction<ExtractedComplaintData>,
    ) => {
      state.extractedData = action.payload;
      state.extractionStatus = "completed";
    },

    setCompleteness: (
      state,
      action: PayloadAction<CompletenessData>,
    ) => {
      state.completeness = action.payload;
    },

    setRiskAssessment: (
      state,
      action: PayloadAction<RiskAssessment>,
    ) => {
      state.risk = action.payload;
      state.riskAssessment = action.payload;
    },

    resetAi: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(sendCopilotMessage.pending, (state) => {
        state.chatPending = true;
        state.error = null;
      })
      .addCase(sendCopilotMessage.fulfilled, (state, action) => {
        state.chatPending = false;
        state.extractedData = action.payload.extractedData;
        state.risk = action.payload.riskAssessment;
        state.riskAssessment = action.payload.riskAssessment;
        state.completeness = action.payload.completeness;
        state.duplicateMatch = action.payload.duplicateMatch;

        addAssistantMessage(
          state,
          action.payload.reply,
          [
            "What should I investigate next?",
            "What CAPA steps should follow?",
          ],
        );
      })
      .addCase(sendCopilotMessage.rejected, (state, action) => {
        state.chatPending = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "AI request failed.";
        addAssistantMessage(state, state.error);
      })
      .addCase(logComplaintWithAi.pending, (state) => {
        state.extractionStatus = "analyzing";
        state.error = null;
      })
      .addCase(logComplaintWithAi.fulfilled, (state, action) => {
        state.extractionStatus = "completed";
        state.extractedData = action.payload.extractedData;
        state.risk = action.payload.riskAssessment;
        state.riskAssessment = action.payload.riskAssessment;
        state.completeness = action.payload.completeness;
        state.duplicateMatch = action.payload.duplicateMatch;
      })
      .addCase(logComplaintWithAi.rejected, (state, action) => {
        state.extractionStatus = "error";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "AI extraction failed.";
      })
      .addCase(editComplaintWithAi.fulfilled, (state, action) => {
        state.extractionStatus = "completed";
        state.extractedData = action.payload.extractedData;
        state.risk = action.payload.riskAssessment;
        state.riskAssessment = action.payload.riskAssessment;
        state.completeness = action.payload.completeness;
        state.duplicateMatch = action.payload.duplicateMatch;
      })
      .addCase(editComplaintWithAi.rejected, (state, action) => {
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "AI edit failed.";
      });
  },
});

export const {
  pushUserMessage,
  setExtractionStatus,
  completeExtraction,
  populateFromAILog,
  setCompleteness,
  setRiskAssessment,
  resetAi,
} = aiSlice.actions;

export default aiSlice.reducer;
export type { AiState, AIChatMessage };
