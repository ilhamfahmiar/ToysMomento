// ============================================================
// Core Data Interfaces
// ============================================================

export interface Testimoni {
  id: string;
  customerName: string;
  review: string;
  productImageUrl?: string;
  rating?: number; // 1-5
}

export interface NavItem {
  label: string;
  /** Jika href dimulai dengan '#', lakukan smooth scroll ke section ID.
   *  Jika href adalah path ('/make-your-moment'), lakukan navigasi halaman. */
  href: string;
  sectionId?: string; // ID section untuk Intersection Observer
}

export interface ProductFeature {
  icon: string; // Lucide icon name
  title: string;
  description: string;
}

export interface ProductSubSection {
  id: "quality" | "customization" | "material";
  title: string;
  description: string;
  features: ProductFeature[];
  imageUrl?: string;
}

// ============================================================
// Make Your Moment Page State
// ============================================================

export type UploadStep = "upload" | "chibi" | "3d";

export interface MakeYourMomentState {
  currentStep: UploadStep;
  uploadedFile: File | null;
  uploadPreviewUrl: string | null;
  chibiImageUrl: string | null;
  conversionStatus: "idle" | "converting" | "success" | "error";
  visualizationStatus: "idle" | "loading" | "success" | "error";
  errorMessage: string | null;
}

// ============================================================
// API Contracts
// ============================================================

export interface ConvertChibiRequest {
  image: File;
}

export interface ConvertChibiResponse {
  success: true;
  chibiImageUrl: string;
}

export interface ConvertChibiErrorResponse {
  success: false;
  error: string;
}

export interface SubmitOrderRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  customizationNotes?: string;
}

export interface SubmitOrderResponse {
  success: boolean;
  message: string;
}

// ============================================================
// Component Props
// ============================================================

export interface PhotoUploaderProps {
  onFileAccepted: (file: File) => void;
  onFileRejected: (reason: "format" | "size") => void;
}

export interface ChibiConverterProps {
  sourceFile: File;
  onConversionComplete: (chibiImageUrl: string) => void;
  onConversionError: () => void;
}

export interface ThreeDVisualizerProps {
  chibiImageUrl: string;
  onOrderNowClick: () => void;
}

export interface StepIndicatorProps {
  currentStep: UploadStep;
}

export interface TestimoniCardProps extends Testimoni {}

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  "aria-label"?: string;
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

// ============================================================
// Order Form
// ============================================================

export interface OrderFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  customizationNotes?: string;
}
