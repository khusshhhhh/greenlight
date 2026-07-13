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
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  notes: z.string().optional(),

  // Responsible stakeholder
  stakeholderName: z.string().optional(),
  stakeholderRole: z.string().optional(),
  stakeholderContact: z.string().optional(),

  // Dwelling details (kept as strings from the form inputs)
  storeys: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  showers: z.string().optional(),
  livingAreas: z.string().optional(),
  carSpaces: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
