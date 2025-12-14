import { Router } from "express";
import { AppointmentController } from "./appointment.controller";

const router = Router();

router.post("/", AppointmentController.createAppointment);

export const AppointmentRoutes = router;
