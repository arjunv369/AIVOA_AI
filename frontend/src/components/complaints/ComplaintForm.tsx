import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateField } from '../../store/slices/complaintSlice';
import { ComplaintField } from './ComplaintField';
import { ComplaintActions } from './ComplaintActions';
import type { ComplaintSource, ComplaintType } from '../../types/complaint';

const COMPLAINT_SOURCES: ComplaintSource[] = [
  'Email',
  'Phone',
  'Web Portal',
  'Sales Representative',
  'Distributor',
  'Healthcare Professional',
  'Other',
];

const COMPLAINT_TYPES: ComplaintType[] = [
  'Product Quality',
  'Packaging Defect',
  'Labeling Issue',
  'Delivery Issue',
  'Adverse Event',
  'Foreign Matter',
  'Contamination',
  'Stability Issue',
  'Other',
];

export const ComplaintForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { formData, fieldBadges, validationErrors, highlightedField } = useAppSelector(
    (state) => state.complaint
  );

  const handleChange = (field: any, value: any) => {
    dispatch(updateField({ field, value }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-xs flex flex-col h-full">
      {/* Form Header */}
      <div className="pb-4 mb-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Log Customer Complaint
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            API & FDF Quality Assurance Module • Review AI-populated fields below
          </p>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6 flex-1">
        {/* SECTION 1 */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">
              1
            </span>
            ORIGIN & CUSTOMER DETAILS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComplaintField
              id="complaint_source"
              label="Complaint Source"
              badge={fieldBadges.complaint_source}
              highlighted={highlightedField === 'complaint_source'}
            >
              <select
                id="complaint_source"
                value={formData.complaint_source || ''}
                onChange={(e) => handleChange('complaint_source', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Awaiting AI extraction...</option>
                {COMPLAINT_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </ComplaintField>

            <ComplaintField
              id="customer_name"
              label="Customer Name"
              badge={fieldBadges.customer_name}
              error={validationErrors.customer_name}
              required
              highlighted={highlightedField === 'customer_name'}
            >
              <input
                type="text"
                id="customer_name"
                value={formData.customer_name || ''}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 placeholder:italic"
              />
            </ComplaintField>
          </div>
        </section>

        {/* SECTION 2 */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">
              2
            </span>
            PRODUCT & BATCH IDENTIFICATION
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComplaintField
              id="product_name"
              label="Product Name"
              badge={fieldBadges.product_name}
              highlighted={highlightedField === 'product_name'}
            >
              <input
                type="text"
                id="product_name"
                value={formData.product_name || ''}
                onChange={(e) => handleChange('product_name', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 placeholder:italic"
              />
            </ComplaintField>

            <ComplaintField
              id="product_strength"
              label="Product Strength / Grade"
              badge={fieldBadges.product_strength}
              highlighted={highlightedField === 'product_strength'}
            >
              <input
                type="text"
                id="product_strength"
                value={formData.product_strength || ''}
                onChange={(e) => handleChange('product_strength', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 placeholder:italic"
              />
            </ComplaintField>

            <ComplaintField
              id="batch_number"
              label="Batch / Lot Number"
              badge={fieldBadges.batch_number}
              highlighted={highlightedField === 'batch_number'}
            >
              <input
                type="text"
                id="batch_number"
                value={formData.batch_number || ''}
                onChange={(e) => handleChange('batch_number', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono placeholder:text-slate-400 placeholder:italic"
              />
            </ComplaintField>

            <ComplaintField
              id="quantity_affected"
              label="Quantity Affected"
              badge={fieldBadges.quantity_affected}
              error={validationErrors.quantity_affected}
              highlighted={highlightedField === 'quantity_affected'}
            >
              <div className="flex items-center">
                <input
                  type="number"
                  id="quantity_affected"
                  value={formData.quantity_affected !== undefined ? formData.quantity_affected : ''}
                  onChange={(e) =>
                    handleChange(
                      'quantity_affected',
                      e.target.value !== '' ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3 py-2 rounded-l-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 placeholder:italic"
                />
                <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-300 text-slate-600 text-xs font-semibold rounded-r-md">
                  kg / units
                </span>
              </div>
            </ComplaintField>

            <ComplaintField
              id="manufacturing_date"
              label="Manufacturing Date"
              badge={fieldBadges.manufacturing_date}
              error={validationErrors.dates}
              highlighted={highlightedField === 'manufacturing_date'}
            >
              <input
                type="date"
                id="manufacturing_date"
                value={formData.manufacturing_date || ''}
                onChange={(e) => handleChange('manufacturing_date', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </ComplaintField>

            <ComplaintField
              id="expiry_date"
              label="Expiry Date"
              badge={fieldBadges.expiry_date}
              error={validationErrors.dates}
              highlighted={highlightedField === 'expiry_date'}
            >
              <input
                type="date"
                id="expiry_date"
                value={formData.expiry_date || ''}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </ComplaintField>
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">
              3
            </span>
            COMPLAINT DETAILS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComplaintField
              id="complaint_type"
              label="Complaint Type"
              badge={fieldBadges.complaint_type}
              highlighted={highlightedField === 'complaint_type'}
            >
              <select
                id="complaint_type"
                value={formData.complaint_type || ''}
                onChange={(e) => handleChange('complaint_type', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Awaiting AI extraction...</option>
                {COMPLAINT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </ComplaintField>

            <ComplaintField
              id="complaint_date"
              label="Complaint Date"
              badge={fieldBadges.complaint_date}
              highlighted={highlightedField === 'complaint_date'}
            >
              <input
                type="date"
                id="complaint_date"
                value={formData.complaint_date || ''}
                onChange={(e) => handleChange('complaint_date', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </ComplaintField>
          </div>

          <ComplaintField
            id="description"
            label="Detailed Complaint Description"
            badge={fieldBadges.description}
            error={validationErrors.description}
            required
            highlighted={highlightedField === 'description'}
          >
            <div className="relative">
              <textarea
                id="description"
                rows={4}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="AI will synthesize the complaint into a formal QMS description..."
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 placeholder:italic resize-y"
              />
              <div className="text-right text-[10px] text-slate-400 font-mono mt-1">
                {(formData.description || '').length} characters
              </div>
            </div>
          </ComplaintField>
        </section>

        {/* SECTION 4 */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">
              4
            </span>
            INITIAL ASSESSMENT & PRIORITY
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComplaintField
              id="initial_severity"
              label="Initial Severity"
              badge={fieldBadges.initial_severity}
              highlighted={highlightedField === 'initial_severity'}
            >
              <select
                id="initial_severity"
                value={formData.initial_severity || ''}
                onChange={(e) => handleChange('initial_severity', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              >
                <option value="">Awaiting AI extraction...</option>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
                <option value="Critical">Critical</option>
              </select>
            </ComplaintField>

            <ComplaintField
              id="priority"
              label="Priority"
              badge={fieldBadges.priority}
              highlighted={highlightedField === 'priority'}
            >
              <select
                id="priority"
                value={formData.priority || ''}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              >
                <option value="">Awaiting AI extraction...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </ComplaintField>
          </div>
        </section>

        {/* Form Action Buttons */}
        <ComplaintActions />
      </form>
    </div>
  );
};
