import { z } from "zod";

export const orderFormSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  phoneNumber: z.string().min(1, "Nomor telepon wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  customizationNotes: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;
