import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  address: z.string().optional(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  lotNumber: z.string().optional(),
  council: z.string().optional(),
  applicationNumber: z.string().optional(),
  planSAReference: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  notes: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
