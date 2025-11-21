import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ScheduleServices } from "./schedule.services";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleServices.createSchedule(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule Created successfully!",
    data: result,
  });
});

export const ScheduleController = {
  createSchedule,
};