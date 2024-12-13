import * as z from "zod";

export const applicationFormSchema = z.object({
  isCurrentlyProcessing: z.boolean(),
  currentProcessor: z.object({
    name: z.string().min(1, "Processor name is required"),
    monthlyVolume: z.string().min(1, "Monthly volume is required"),
    reasonForLeaving: z.string().min(1, "Reason for leaving is required"),
  }).optional(),
  hasBeenTerminated: z.boolean(),
  terminationDetails: z.object({
    previousProcessor: z.string().min(1, "Previous processor name is required"),
    terminationReason: z.string().min(1, "Termination reason is required"),
    date: z.string().min(1, "Termination date is required"),
  }).optional(),
}).refine((data) => {
  // Validate current processor details
  if (data.isCurrentlyProcessing && !data.currentProcessor) {
    return false;
  }
  return true;
}, {
  message: "Current processor details are required when currently processing",
  path: ["currentProcessor"],
}).refine((data) => {
  // Validate termination details
  if (data.hasBeenTerminated && !data.terminationDetails) {
    return false;
  }
  return true;
}, {
  message: "Termination details are required when previously terminated",
  path: ["terminationDetails"],
}); 