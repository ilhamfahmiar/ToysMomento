import React from "react";
import { Check } from "lucide-react";
import { UploadStep, StepIndicatorProps } from "@/types";

const steps: { id: UploadStep; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "chibi", label: "Chibi" },
  { id: "3d", label: "3D" },
];

const stepOrder: Record<UploadStep, number> = {
  upload: 0,
  chibi: 1,
  "3d": 2,
};

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const currentIndex = stepOrder[currentStep];

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-center gap-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-primary border-primary text-white"
                        : isActive
                          ? "bg-white border-primary text-primary shadow-md shadow-primary/20"
                          : "bg-white border-gray-300 text-gray-400"
                    }
                  `}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium transition-colors duration-300
                    ${isActive ? "text-primary" : isCompleted ? "text-green-700" : "text-gray-400"}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`
                    w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-colors duration-300
                    ${index < currentIndex ? "bg-primary" : "bg-gray-200"}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;
