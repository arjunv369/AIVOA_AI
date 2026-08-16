import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  createComplaint,
  updateComplaint,
} from "@/services/complaintApi";
import type {
  ComplaintErrors,
  ComplaintFieldBadges,
  ComplaintFormData,
  ComplaintPayload,
  ComplaintRecord,
  FieldSourceBadge,
} from "@/types/complaint";
import type { ExtractedComplaintData } from "@/types/ai";
import { emptyComplaintForm, toComplaintPayload, validateComplaintForm } from "@/utils/validation";

interface ComplaintState {
  form: ComplaintFormData;
  fieldBadges: ComplaintFieldBadges;
  validationErrors: ComplaintErrors;
  currentComplaint: ComplaintRecord | null;
  loadingComplaint: boolean;
  saving: boolean;
  loadError: string | null;
  saveError: string | null;
}

const initialFieldBadges: ComplaintFieldBadges = Object.fromEntries(
  Object.keys(emptyComplaintForm).map((field) => [
    field,
    "Awaiting AI extraction..." as FieldSourceBadge,
  ]),
);

const initialState: ComplaintState = {
  form: { ...emptyComplaintForm },
  fieldBadges: initialFieldBadges,
  validationErrors: {},
  currentComplaint: null,
  loadingComplaint: false,
  saving: false,
  loadError: null,
  saveError: null,
};

export const saveComplaint = createAsyncThunk(
  "complaint/saveComplaint",
  async (payload: ComplaintPayload, { rejectWithValue }) => {
    try {
      return await createComplaint(payload);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to save complaint.",
      );
    }
  },
);

export const editComplaint = createAsyncThunk(
  "complaint/editComplaint",
  async (
    {
      id,
      payload,
    }: {
      id: string | number;
      payload: ComplaintPayload;
    },
    { rejectWithValue },
  ) => {
    try {
      return await updateComplaint(id, payload);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to update complaint.",
      );
    }
  },
);

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {
    updateFormField: (
      state,
      action: PayloadAction<{
        field: keyof ComplaintFormData;
        value: string;
      }>,
    ) => {
      state.form[action.payload.field] = action.payload.value;
      state.fieldBadges[action.payload.field] = "User entered";
      delete state.validationErrors[action.payload.field];
    },

    setForm: (state, action: PayloadAction<ComplaintFormData>) => {
      state.form = action.payload;
    },

    populateFromAI: (
      state,
      action: PayloadAction<Partial<ComplaintPayload>>,
    ) => {
      for (const [key, rawValue] of Object.entries(action.payload)) {
        if (!(key in state.form) || rawValue === undefined || rawValue === null) {
          continue;
        }

        const field = key as keyof ComplaintFormData;
        state.form[field] = String(rawValue);
        state.fieldBadges[field] = "AI extracted";
      }
    },


    populateFromAILog: (
      state,
      action: PayloadAction<ExtractedComplaintData>,
    ) => {
      for (const [key, rawValue] of Object.entries(action.payload)) {
        if (!(key in state.form) || rawValue === undefined || rawValue === null) {
          continue;
        }

        const field = key as keyof ComplaintFormData;
        state.form[field] = String(rawValue);
        state.fieldBadges[field] = "AI extracted";
      }
    },

    resetComplaintForm: (state) => {
      state.form = { ...emptyComplaintForm };
      state.fieldBadges = Object.fromEntries(
        Object.keys(emptyComplaintForm).map((field) => [
          field,
          "Awaiting AI extraction..." as FieldSourceBadge,
        ]),
      );
      state.validationErrors = {};
      state.saveError = null;
    },

    validateForm: (state) => {
      state.validationErrors = validateComplaintForm(state.form);
    },

    setValidationErrors: (
      state,
      action: PayloadAction<ComplaintErrors>,
    ) => {
      state.validationErrors = action.payload;
    },

    clearSaveError: (state) => {
      state.saveError = null;
    },

    setCurrentComplaint: (
      state,
      action: PayloadAction<ComplaintRecord | null>,
    ) => {
      state.currentComplaint = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(saveComplaint.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(saveComplaint.fulfilled, (state, action) => {
        state.saving = false;
        state.currentComplaint = action.payload;
      })
      .addCase(saveComplaint.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to save complaint.";
      })
      .addCase(editComplaint.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(editComplaint.fulfilled, (state, action) => {
        state.saving = false;
        state.currentComplaint = action.payload;
      })
      .addCase(editComplaint.rejected, (state, action) => {
        state.saving = false;
        state.saveError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to update complaint.";
      });
  },
});

export const {
  updateFormField,
  setForm,
  populateFromAI,
  populateFromAILog,
  resetComplaintForm,
  validateForm,
  setValidationErrors,
  clearSaveError,
  setCurrentComplaint,
} = complaintSlice.actions;

export { toComplaintPayload };
export default complaintSlice.reducer;
export type { ComplaintState };
