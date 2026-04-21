import React from "react";
import { AlertCircle } from "lucide-react";
import { ErrorMessageProps } from "@/types";
import Button from "./Button";

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-700 text-sm">{message}</p>
        {onRetry && (
          <Button
            variant="ghost"
            onClick={onRetry}
            className="mt-2 text-red-700 hover:bg-red-100 px-4 py-2 text-sm"
            aria-label="Coba lagi"
          >
            Coba Lagi
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
