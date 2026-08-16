import type { ComplaintPayload } from '../types/complaint';
import type { RiskAssessmentData } from '../types/ai';

export interface ParseResult {
  toolType: 'LOG_COMPLAINT' | 'EDIT_COMPLAINT' | 'DOCUMENT_EXTRACTION' | 'GENERAL_CHAT';
  extractedData: Partial<ComplaintPayload>;
  updatedFieldsList?: string[];
  riskAssessment?: RiskAssessmentData;
  explanation: string;
}

/**
 * Natural language intent parser for simulated AI Copilot tools
 */
export const parseCopilotMessage = (
  userText: string,
  existingState: ComplaintPayload
): ParseResult => {
  const text = userText.trim();
  const lower = text.toLowerCase();

  // Check if edit command
  const isEditMode =
    Boolean(existingState.customer_name || existingState.product_name) &&
    (lower.startsWith('sorry') ||
      lower.startsWith('update') ||
      lower.includes('batch number is') ||
      lower.includes('batch is') ||
      lower.includes('quantity is') ||
      lower.includes('change') ||
      lower.includes('correct'));

  if (isEditMode) {
    const changes: Partial<ComplaintPayload> = {};
    const updatedFieldsList: string[] = [];

    // Batch extraction regex
    const batchMatch = text.match(/(?:batch\s*(?:number)?\s*(?:is|=|:)?\s*)([A-Z0-9_-]{4,15})/i);
    if (batchMatch && batchMatch[1]) {
      changes.batch_number = batchMatch[1].toUpperCase();
      updatedFieldsList.push('Batch Number → ' + changes.batch_number);
    }

    // Quantity extraction regex
    const qtyMatch = text.match(/(?:quantity|affected quantity|quantity affected|amount)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)\s*(capsules|kg|tablets|units|drums|strips)?/i);
    if (qtyMatch && qtyMatch[1]) {
      changes.quantity_affected = parseFloat(qtyMatch[1]);
      const unit = qtyMatch[2] ? ` ${qtyMatch[2]}` : '';
      updatedFieldsList.push(`Affected Quantity → ${changes.quantity_affected}${unit}`);
    }

    // Customer name extraction
    const customerMatch = text.match(/(?:customer|client)\s*(?:is|=|:)?\s*([A-Za-z0-9\s]{3,30})/i);
    if (customerMatch && customerMatch[1] && !batchMatch) {
      changes.customer_name = customerMatch[1].trim();
      updatedFieldsList.push('Customer Name → ' + changes.customer_name);
    }

    // Expiry date extraction
    const expiryMatch = text.match(/(?:expiry|exp date)\s*(?:is|=|:)?\s*(\d{4}-\d{2}-\d{2})/i);
    if (expiryMatch && expiryMatch[1]) {
      changes.expiry_date = expiryMatch[1];
      updatedFieldsList.push('Expiry Date → ' + changes.expiry_date);
    }

    if (Object.keys(changes).length === 0) {
      // Fallback edit parsing
      changes.description = existingState.description
        ? `${existingState.description} [Update note: ${text}]`
        : text;
      updatedFieldsList.push('Description updated');
    }

    // Recalculate risk assessment if quantity or severity changed
    const newQty = changes.quantity_affected ?? existingState.quantity_affected;
    let newSeverity = existingState.initial_severity || 'Major';
    let newPriority = existingState.priority || 'High';

    if (newQty && newQty > 1000) {
      newSeverity = 'Critical';
      newPriority = 'Urgent';
    }

    const explanation = `Updated the complaint:\n${updatedFieldsList.join('\n')}\n\nAll other complaint information remains unchanged. Risk assessment has been updated.`;

    return {
      toolType: 'EDIT_COMPLAINT',
      extractedData: changes,
      updatedFieldsList,
      riskAssessment: {
        overallRisk: newSeverity === 'Critical' ? 'CRITICAL' : 'HIGH',
        severity: newSeverity as any,
        priority: newPriority as any,
        confidenceScore: 92,
        potentialImpact: `Updated batch ${changes.batch_number || existingState.batch_number || 'record'} with ${newQty || 'specified'} units affected.`,
      },
      explanation,
    };
  }

  // Check if Log Complaint Intent
  if (
    lower.includes('reported') ||
    lower.includes('complaint') ||
    lower.includes('damaged') ||
    lower.includes('discolored') ||
    lower.includes('contamination') ||
    lower.includes('defect') ||
    lower.includes('capsules') ||
    lower.includes('tablets')
  ) {
    const extractedData: Partial<ComplaintPayload> = {
      complaint_source: lower.includes('email') ? 'Email' : lower.includes('phone') ? 'Phone' : 'Web Portal',
      customer_name: 'Apollo Pharmacy',
      product_name: 'Amoxicillin Capsules',
      product_strength: '500 mg',
      complaint_type: 'Product Quality',
      complaint_date: new Date().toISOString().split('T')[0],
      description: text,
      initial_severity: 'Major',
      priority: 'High',
    };

    // Specific text extractions
    if (lower.includes('apollo pharmacy')) extractedData.customer_name = 'Apollo Pharmacy';
    else if (lower.includes('abc pharma')) extractedData.customer_name = 'ABC Pharma Distributors';

    if (lower.includes('amoxicillin')) {
      extractedData.product_name = 'Amoxicillin Capsules';
      extractedData.product_strength = '500 mg';
    } else if (lower.includes('paracetamol')) {
      extractedData.product_name = 'Paracetamol Tablets';
      extractedData.product_strength = '500 mg';
    } else if (lower.includes('metformin')) {
      extractedData.product_name = 'Metformin hydrochloride API';
      extractedData.product_strength = 'IP/BP Grade';
    }

    const explanation = `I identified a potential product quality complaint.\n\nProduct: ${extractedData.product_name}\nStrength: ${extractedData.product_strength}\nCustomer: ${extractedData.customer_name}\n\nI have populated the complaint form on the left and completed an initial risk assessment.`;

    return {
      toolType: 'LOG_COMPLAINT',
      extractedData,
      riskAssessment: {
        overallRisk: 'HIGH',
        severity: 'Major',
        priority: 'High',
        confidenceScore: 87,
        potentialImpact: 'Potential product quality issue (discoloration / defect) requiring QA investigation before further distribution.',
      },
      explanation,
    };
  }

  // Default general chat response
  return {
    toolType: 'GENERAL_CHAT',
    extractedData: {},
    explanation: 'I am your AIVOA QMS Copilot. You can type a customer complaint in natural language, upload a document, or tell me to update any specific complaint fields.',
  };
};

/**
 * Mock document extraction tool for PDF, DOCX, TXT, EML files
 */
export const extractDocumentData = (fileName: string): ParseResult => {
  const isMetformin = fileName.toLowerCase().includes('metformin') || fileName.toLowerCase().includes('api');

  if (isMetformin) {
    return {
      toolType: 'DOCUMENT_EXTRACTION',
      extractedData: {
        complaint_source: 'Email',
        customer_name: 'Novartis Healthcare Pvt Ltd',
        product_name: 'Metformin hydrochloride API',
        product_strength: 'IP/BP Grade',
        batch_number: 'MFH260712A',
        manufacturing_date: '2026-07-12',
        expiry_date: '2029-07-11',
        quantity_affected: 25,
        complaint_type: 'Stability Issue',
        complaint_date: new Date().toISOString().split('T')[0],
        description: `Document analysis (${fileName}): Received report regarding particle size distribution variation and moisture content fluctuation in Metformin hydrochloride API lot MFH260712A.`,
        initial_severity: 'Major',
        priority: 'High',
      },
      riskAssessment: {
        overallRisk: 'HIGH',
        severity: 'Major',
        priority: 'High',
        confidenceScore: 94,
        potentialImpact: 'Moisture content & particle size deviation in API batch MFH260712A affecting solid oral dosage formulations.',
      },
      explanation: `I extracted the following complaint information from ${fileName}:\n\nProduct: Metformin hydrochloride API\nGrade: IP/BP Grade\nBatch: MFH260712A\nCustomer: Novartis Healthcare Pvt Ltd\n\nThe complaint form has been populated and the initial risk assessment is complete.`,
    };
  }

  // Default pharmaceutical document extraction mock
  return {
    toolType: 'DOCUMENT_EXTRACTION',
    extractedData: {
      complaint_source: 'Email',
      customer_name: 'ABC Pharma Distributors',
      product_name: 'Paracetamol Tablets',
      product_strength: '500 mg',
      batch_number: 'PCM500-2026-07',
      manufacturing_date: '2026-07-01',
      expiry_date: '2028-06-30',
      quantity_affected: 2500,
      complaint_type: 'Product Quality',
      complaint_date: new Date().toISOString().split('T')[0],
      description: `Document analysis (${fileName}): Customer reported that several tablet strips were damaged in transit and some tablets appeared discolored upon secondary packaging inspection.`,
      initial_severity: 'Major',
      priority: 'High',
    },
    riskAssessment: {
      overallRisk: 'HIGH',
      severity: 'Major',
      priority: 'High',
      confidenceScore: 89,
      potentialImpact: 'Damaged strips and discolored tablets in batch PCM500-2026-07 affecting 2500 units.',
    },
    explanation: `I extracted the following complaint information from ${fileName}:\n\nProduct: Paracetamol Tablets 500 mg\nBatch: PCM500-2026-07\nCustomer: ABC Pharma Distributors\nQuantity: 2500 kg/units\n\nThe complaint form has been populated and initial risk assessment is complete.`,
  };
};
