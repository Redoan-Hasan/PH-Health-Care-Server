import httpStatus  from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AppointmentServices } from './appointment.services';

const createAppointment = catchAsync(async (req, res) => {
  const result = await AppointmentServices.createAppointment();
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
