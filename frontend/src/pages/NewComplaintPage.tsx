import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ComplaintForm } from '../components/complaints/ComplaintForm';
import { AIIntakeAssistant } from '../components/ai/AIIntakeAssistant';
import { WorkflowIndicator } from '../components/common/WorkflowIndicator';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setWorkflowStep } from '../store/slices/complaintSlice';

export const NewComplaintPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeWorkflowStep } = useAppSelector((state) => state.complaint);

  return (
    <PageContainer>
      {/* Workflow Progress Indicator */}
      <WorkflowIndicator
        currentStep={activeWorkflowStep}
        onStepClick={(step) => dispatch(setWorkflowStep(step))}
      />

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT FORM AREA (60-65% width on desktop -> 7 columns of 12) */}
        <div className="lg:col-span-7 xl:col-span-7">
          <ComplaintForm />
        </div>

        {/* RIGHT AI COPILOT PANEL (35-40% width on desktop -> 5 columns of 12) */}
        <div className="lg:col-span-5 xl:col-span-5">
          <AIIntakeAssistant />
        </div>
      </div>
    </PageContainer>
  );
};
