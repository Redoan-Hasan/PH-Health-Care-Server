import { JwtPayload } from 'jsonwebtoken';
import httpStatus  from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AppointmentServices } from './appointment.services';
import { Request, Response } from 'express';
import { pick } from '../../helper/pick';
import { appointmentsFilterableFields } from './appointmentsFilterableFields';

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

const getAllMyAppointments = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
    const filter = pick(req.query, appointmentsFilterableFields);
    const options = pick(req.query, [ "page", "limit","sortBy", "sortOrder"]);
    const user = req.user;
  const result = await AppointmentServices.getAllMyAppointments(user as JwtPayload,filter,options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All appointments fetched successfully",
    data: result,
  });
});

const updateAppointmentStatus = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
    const {id} = req.params;
    const {status} = req.body;
    const user = req.user;
    console.log(id,status, user);
  const result = await AppointmentServices.updateAppointmentStatus(id,status,user as JwtPayload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Appointment status updated successfully`,
    data: result,
  });
});

export const AppointmentController = {
  createAppointment,
  getAllMyAppointments,
  updateAppointmentStatus,
};
