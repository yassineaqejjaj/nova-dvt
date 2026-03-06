import React, { useState } from 'react';
import { FlowStep, SprintConfig, TeamMember, Absence, Meeting } from './types';
import StepIndicator from './StepIndicator';
import StepSprintSetup from './StepSprintSetup';
import StepTeamSetup from './StepTeamSetup';
import StepAbsences from './StepAbsences';
import StepMeetings from './StepMeetings';
import StepCapacityResult from './StepCapacityResult';

const SprintIntelligence: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('sprint-setup');
  const [completedSteps, setCompletedSteps] = useState<FlowStep[]>([]);

  const [sprintConfig, setSprintConfig] = useState<SprintConfig>({
    name: '',
    startDate: '',
    endDate: '',
    holidays: [],
    hoursPerDay: 7,
  });

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const goTo = (step: FlowStep) => {
    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    setCurrentStep(step);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold tracking-tight">Sprint Intelligence</h2>
        <p className="text-sm text-muted-foreground">
          Calculez la capacité réelle de votre sprint à partir des données d'équipe
        </p>
      </div>

      <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

      {currentStep === 'sprint-setup' && (
        <StepSprintSetup config={sprintConfig} onChange={setSprintConfig} onNext={() => goTo('team')} />
      )}
      {currentStep === 'team' && (
        <StepTeamSetup members={members} onChange={setMembers} onNext={() => goTo('absences')} onBack={() => setCurrentStep('sprint-setup')} />
      )}
      {currentStep === 'absences' && (
        <StepAbsences absences={absences} members={members} onChange={setAbsences} onNext={() => goTo('meetings')} onBack={() => setCurrentStep('team')} />
      )}
      {currentStep === 'meetings' && (
        <StepMeetings meetings={meetings} members={members} sprintConfig={sprintConfig} onChange={setMeetings} onNext={() => goTo('result')} onBack={() => setCurrentStep('absences')} />
      )}
      {currentStep === 'result' && (
        <StepCapacityResult sprintConfig={sprintConfig} members={members} absences={absences} meetings={meetings} onBack={() => setCurrentStep('meetings')} />
      )}
    </div>
  );
};

export default SprintIntelligence;
