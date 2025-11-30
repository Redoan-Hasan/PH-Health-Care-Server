import { Router } from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import { auth } from "../../helper/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { insertSchedulesForDoctorZodSchema } from "./doctorSchedule.zod";

const router = Router();

router.post(
  "/",
  auth(UserRole.DOCTOR),
  validateRequest(insertSchedulesForDoctorZodSchema),
  DoctorScheduleController.insertSchedulesForDoctor
);

export const DoctorScheduleRoutes = router;
