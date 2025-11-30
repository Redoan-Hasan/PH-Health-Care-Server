import { Doctor } from "@prisma/client";
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { doctorScheduleServices } from "./doctorSchedule.services";
import { JwtPayload } from "jsonwebtoken";

const insertSchedulesForDoctor = catchAsync(
  async (req: Request & { user?: JwtPayload }, res: Response) => {
    const user = req.user;
    console.log(user);
    const result = await doctorScheduleServices.insertSchedulesForDoctor(
      user as JwtPayload,
      req.body
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Schedule Created successfuly!",
      data: result,
    });
  }
);

export const DoctorScheduleController = {
  insertSchedulesForDoctor,
};
