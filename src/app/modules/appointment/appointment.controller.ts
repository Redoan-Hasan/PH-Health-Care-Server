import { JwtPayload } from 'jsonwebtoken';
import httpStatus  from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AppointmentServices } from './appointment.services';
import { Request, Response } from 'express';

const createAppointment = catchAsync(async (req: Request & { user?: JwtPayload }, res : Response) => {
  const user = req.user;
  const result = await AppointmentServices.createAppointment(user as JwtPayload, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Appointment created successfully!',
    data: result,
  });
});

export const AppointmentController = {
  createAppointment,
};
