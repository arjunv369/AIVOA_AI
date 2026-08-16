import React from 'react';
import { RotateCcw, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  clearSaveState,
  resetForm,
  saveComplaintThunk,
  setValidationErrors,
} from '../../store/slices/complaintSlice';
import { validateComplaintForm } from '../../utils/validation';

export const ComplaintActions: React.FC = () => {
  const dispatch = useAppDispatch();
  const { formData, isSaving, saveSuccess, saveError } = useAppSelector(
    (state) => state.complaint
  );

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the complaint form?')) {
      dispatch(resetForm());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearSaveState());

    const errors = validateComplaintForm(formData);
    if (Object.keys(errors).length > 0) {
      dispatch(setValidationErrors(errors));
      return;
    }

    dispatch(saveComplaintThunk(formData));
  };

  return (
    <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Inline Feedback Alerts */}
      <div className="flex-1">
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Complaint successfully saved to FastAPI backend!</span>
          </div>
        )}

        {saveError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Unable to connect to the complaint management server.</p>
              <p className="text-[11px] font-normal text-rose-700 mt-0.5">{saveError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving}
          className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Form
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Complaint'}
        </button>
      </div>
    </div>
  );
};
