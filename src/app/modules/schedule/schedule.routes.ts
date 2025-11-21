import { NextFunction, Request, Response, Router } from "express";
import { ScheduleController } from "./schedule.controller";
const router = Router();

router.post(
  "/create",
//   (req: Request, res: Response, next: NextFunction) => {
//     req.body = createPatientZodSchema.parse(JSON.parse(req.body.data));
//     return UserController.createPatient(req, res, next);
//   }
    ScheduleController.createSchedule
);

export const ScheduleRoutes = router;