import React from 'react';
import { Upload, Cpu, CheckCircle2, ShieldAlert, Save } from 'lucide-react';

interface WorkflowIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  onStepClick?: (step: 1 | 2 | 3 | 4 | 5) => void;
}

export const WorkflowIndicator: React.FC<WorkflowIndicatorProps> = ({
  currentStep,
  onStepClick,
}) => {
  const steps = [
    { id: 1, label: 'Upload', icon: Upload },
    { id: 2, label: 'Extraction', icon: Cpu },
    { id: 3, label: 'Review', icon: CheckCircle2 },
    { id: 4, label: 'Risk Assessment', icon: ShieldAlert },
    { id: 5, label: 'Save', icon: Save },
  ];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg p-3 shadow-xs mb-4">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isPassed = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(step.id as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                    : isPassed
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step.id}
                </span>
                <Icon className="w-3.5 h-3.5 hidden sm:inline" />
                <span>{step.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1.5 transition-colors ${
                    isPassed ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
