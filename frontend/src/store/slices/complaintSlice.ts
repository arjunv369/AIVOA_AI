import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type {
  ComplaintFormData,
  ComplaintPayload,
  ComplaintRecord,
  FormValidationErrors,
} from "../../types/complaint";
import { createComplaint } from '../../services/complaintApi';

export type FieldSourceBadge = 'Awaiting AI extraction...' | 'AI Extracted' | 'AI Updated' | 'AI Generated' | 'User Modified';

export interface ComplaintState {
  formData: ComplaintPayload;
  fieldBadges: Partial<Record<keyof ComplaintPayload, FieldSourceBadge>>;
  validationErrors: FormValidationErrors;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  savedComplaint: ComplaintRecord | null;
  highlightedField: string | null;
  activeWorkflowStep: 1 | 2 | 3 | 4 | 5;
}

export const initialFormData: ComplaintPayload = {
  complaint_source: '',
  customer_name: '',
  product_name: '',
  product_strength: '',
  batch_number: '',
  manufacturing_date: '',
  expiry_date: '',
  quantity_affected: undefined,
  complaint_type: '',
  complaint_date: new Date().toISOString().split('T')[0],
  description: '',
  initial_severity: '',
  priority: '',
};

const initialFieldBadges: Record<keyof ComplaintFormData, FieldSourceBadge> = {
  complaint_source: 'Awaiting AI extraction...',
  customer_name: 'Awaiting AI extraction...',
  product_name: 'Awaiting AI extraction...',
  product_strength: 'Awaiting AI extraction...',
  batch_number: 'Awaiting AI extraction...',
  manufacturing_date: 'Awaiting AI extraction...',
  expiry_date: 'Awaiting AI extraction...',
  quantity_affected: 'Awaiting AI extraction...',
  complaint_type: 'Awaiting AI extraction...',
  complaint_date: 'Awaiting AI extraction...',
  description: 'Awaiting AI extraction...',
  initial_severity: 'Awaiting AI extraction...',
  priority: 'Awaiting AI extraction...',
};

const initialState: ComplaintState = {
  formData: { ...initialFormData },
  fieldBadges: { ...initialFieldBadges },
  validationErrors: {},
  isSaving: false,
  saveSuccess: false,
  saveError: null,
  savedComplaint: null,
  highlightedField: null,
  activeWorkflowStep: 1,
};

export const saveComplaintThunk = createAsyncThunk(
  'complaint/saveComplaint',
  async (payload: ComplaintPayload, { rejectWithValue }) => {
    try {
      const data = await createComplaint(payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.message || 'Unable to connect to the complaint management server. Check that FastAPI is running on http://127.0.0.1:8000.'
      );
    }
  }
);

export const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    updateField: (
      state,
      action: PayloadAction<{ field: keyof ComplaintPayload; value: any }>
    ) => {
      const { field, value } = action.payload;
      state.formData[field] = value as never;
      state.fieldBadges[field] = 'User Modified';

      if (state.validationErrors[field as keyof FormValidationErrors]) {
        delete state.validationErrors[field as keyof FormValidationErrors];
      }
    },
    populateFromAILog: (
      state,
      action: PayloadAction<Partial<ComplaintPayload>>
    ) => {
      const extracted = action.payload;
      (Object.keys(extracted) as (keyof ComplaintPayload)[]).forEach((key) => {
        if (extracted[key] !== undefined && extracted[key] !== '') {
          state.formData[key] = extracted[key] as never;
          state.fieldBadges[key] = 'AI Extracted';
        }
      });
      state.activeWorkflowStep = 3; // Review step
    },
    editFromAI: (
      state,
      action: PayloadAction<Partial<ComplaintPayload>>
    ) => {
      const updates = action.payload;
      (Object.keys(updates) as (keyof ComplaintPayload)[]).forEach((key) => {
        if (updates[key] !== undefined && updates[key] !== '') {
          state.formData[key] = updates[key] as never;
          state.fieldBadges[key] = 'AI Updated';
        }
      });
      state.activeWorkflowStep = 4; // Risk Assessment update step
    },
    setValidationErrors: (state, action: PayloadAction<FormValidationErrors>) => {
      state.validationErrors = action.payload;
    },
    setHighlightedField: (state, action: PayloadAction<string | null>) => {
      state.highlightedField = action.payload;
    },
    setWorkflowStep: (state, action: PayloadAction<1 | 2 | 3 | 4 | 5>) => {
      state.activeWorkflowStep = action.payload;
    },
    resetForm: (state) => {
      state.formData = {
        ...initialFormData,
        complaint_date: new Date().toISOString().split('T')[0],
      };
      state.fieldBadges = { ...initialFieldBadges };
      state.validationErrors = {};
      state.isSaving = false;
      state.saveSuccess = false;
      state.saveError = null;
      state.savedComplaint = null;
      state.highlightedField = null;
      state.activeWorkflowStep = 1;
    },
    clearSaveState: (state) => {
      state.saveSuccess = false;
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveComplaintThunk.pending, (state) => {
        state.isSaving = true;
        state.saveSuccess = false;
        state.saveError = null;
      })
      .addCase(saveComplaintThunk.fulfilled, (state, action: PayloadAction<ComplaintRecord>) => {
        state.isSaving = false;
        state.saveSuccess = true;
        state.savedComplaint = action.payload;
        state.activeWorkflowStep = 5;
      })
      .addCase(saveComplaintThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.saveSuccess = false;
        state.saveError = (action.payload as string) || 'Failed to save complaint.';
      });
  },
});

export const {
  updateField,
  populateFromAILog,
  editFromAI,
  setValidationErrors,
  setHighlightedField,
  setWorkflowStep,
  resetForm,
  clearSaveState,
} = complaintSlice.actions;

export default complaintSlice.reducer;

