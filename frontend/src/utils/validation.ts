import type { ComplaintPayload, FormValidationErrors } from '../types/complaint';

export const validateComplaintForm = (
  formData: ComplaintPayload
): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (!formData.customer_name || formData.customer_name.trim() === '') {
    errors.customer_name = 'Customer Name is required.';
  }

  if (!formData.description || formData.description.trim() === '') {
    errors.description = 'Detailed Complaint Description is required.';
  }

  if (
    formData.quantity_affected !== undefined &&
    formData.quantity_affected !== null &&
    formData.quantity_affected < 0
  ) {
    errors.quantity_affected = 'Quantity affected must be greater than or equal to 0.';
  }

  if (formData.manufacturing_date && formData.expiry_date) {
    const mfg = new Date(formData.manufacturing_date);
    const exp = new Date(formData.expiry_date);
    if (exp < mfg) {
      errors.dates = 'Expiry Date cannot be before Manufacturing Date.';
    }
  }

  return errors;
};
