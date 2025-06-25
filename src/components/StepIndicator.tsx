import React from 'react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Getting Started</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex items-center space-x-4">
              {/* Step Circle */}
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isActive 
                    ? 'bg-blue-500 text-white animate-pulse' 
                    : 'bg-gray-200 text-gray-500'
                }
              `}>
                {isCompleted ? '✓' : step.icon}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <h4 className={`
                  text-sm font-medium
                  ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                `}>
                  {step.title}
                </h4>
                <p className={`
                  text-xs mt-1
                  ${isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-400'}
                `}>
                  {step.description}
                </p>
              </div>
              
              {/* Connect Line */}
              {index < steps.length - 1 && (
                <div className={`
                  absolute left-9 mt-8 w-0.5 h-4 -z-10
                  ${currentStep > step.id ? 'bg-green-300' : 'bg-gray-200'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
