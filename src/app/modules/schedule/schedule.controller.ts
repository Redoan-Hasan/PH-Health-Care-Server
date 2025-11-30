import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ScheduleServices } from "./schedule.services";
import { pick } from "../../helper/pick";
import { JwtPayload } from "jsonwebtoken";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleServices.createSchedule(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule Created successfully!",
    data: result,
  });
});

const schedulesForDoctor = catchAsync(async (req: Request & { user?: JwtPayload}, res: Response) => {
  const filter = pick(req.query, ["startDateTime", "endDateTime"]);
  const options = pick(req.query, [ "page", "limit","sortBy", "sortOrder"]);
  const result = await ScheduleServices.schedulesForDoctor(options, filter, req.user as JwtPayload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "All Schedules retrieved successfuly!",
    data: result.data,
    meta:result.meta
  });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleServices.deleteSchedule(req.params?.id);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "All Schedules retrieved successfuly!",
    data: result
  });
});

export const ScheduleController = {
  createSchedule,
  schedulesForDoctor,
  deleteSchedule
};