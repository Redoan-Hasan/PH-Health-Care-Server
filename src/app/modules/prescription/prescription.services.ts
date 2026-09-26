import httpStatus from "http-status";
import {
  AppointmentStatus,
  PaymentStatus,
  Prescription,
  UserRole,
} from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../shared/prisma";
import ApiError from "../../../errorHelpers/ApiError";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";

const createPrescription = async (
  user: JwtPayload,
  payload: Partial<Prescription>,
) => {
  const isAppointmentExist = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: { doctor: true },
  });

  if (user.role === UserRole.DOCTOR) {
    if (!(user.email === isAppointmentExist.doctor.email))
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You are not authorized to create prescription for this appointment",
      );
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: isAppointmentExist.id,
      doctorId: isAppointmentExist.doctorId,
      patientId: isAppointmentExist.patientId,
      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate || null,
    },
    include: {
      patient: true,
    },
  });

  return result;
};

const myPrescriptions = async (user: JwtPayload, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const result = await prisma.prescription.findMany({
    where: {
      patient: {
        email: user.email,
      },
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });
  const total = await prisma.prescription.count({
    where: {
      patient: {
        email: user.email,
      },
    },
  });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const PrescriptionServices = {
  createPrescription,
  myPrescriptions,
};
