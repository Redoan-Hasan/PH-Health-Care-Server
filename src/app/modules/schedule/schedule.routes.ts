import { NextFunction, Request, Response, Router } from "express";
import { ScheduleController } from "./schedule.controller";
import { UserRole } from "@prisma/client";
import { auth } from "../../helper/auth";
const router = Router();

router.post(
  "/create",
//   (req: Request, res: Response, next: NextFunction) => {
//     req.body = createPatientZodSchema.parse(JSON.parse(req.body.data));
//     return UserController.createPatient(req, res, next);
//   }
    ScheduleController.createSchedule
);
router.get("/",auth(UserRole.DOCTOR), ScheduleController.schedulesForDoctor);
router.delete("/:id", ScheduleController.deleteSchedule);

export const ScheduleRoutes = router;