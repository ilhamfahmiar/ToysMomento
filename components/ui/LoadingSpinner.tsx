import React from "react";
import { LoadingSpinnerProps } from "@/types";

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`inline-block ${className}`}
    >
      <div
        className={`${sizeStyles[size]} border-4 border-primary border-t-transparent rounded-full animate-spin`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
