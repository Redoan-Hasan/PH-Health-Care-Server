import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { auth } from "../../helper/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/",
  auth(UserRole.PATIENT),
  AppointmentController.createAppointment
);

router.get(
  "/",
  auth(UserRole.PATIENT),
  AppointmentController.getAllAppointments
);

export const AppointmentRoutes = router;
