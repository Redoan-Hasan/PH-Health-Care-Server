import z from "zod";

export const insertSchedulesForDoctorZodSchema = z.object({
  body: z.object({
    scheduleIds: z.array(z.string()),
  }),
});
