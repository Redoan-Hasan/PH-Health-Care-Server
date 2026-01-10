import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../shared/prisma";
import { v4 as uuidv4 } from "uuid";
import { stripe } from "../../helper/stripe";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import {
  Appointment,
  AppointmentStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
import ApiError from "../../../errorHelpers/ApiError";

const createAppointment = async (
  user: JwtPayload,
  payload: { doctorId: string; scheduleId: string }
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });
  const isBooked = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      scheduleId: payload.scheduleId,
      doctorId: payload.doctorId,
      isBooked: false,
    },
  });
  const videoCallingId = uuidv4();
  const result = await prisma.$transaction(async (tnx) => {
    const appointment = await tnx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
    });
    await tnx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });
    const transactionId = uuidv4();
    const payment = await tnx.payment.create({
      data: {
        appointmentId: appointment.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Appointment with Dr. ${doctorData.name}`,
              description: `Appointment for ${patientData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://bindu-logic-clone.vercel.app`,
      cancel_url: `https://arthub-d9977.web.app`,
      metadata: {
        appointmentId: appointment.id,
        paymentId: payment.id,
      },
    });
    // console.log(session);
    return { paymentUrl: session.url };
  });
  return result;
};

const getAllMyAppointments = async (
  user: JwtPayload,
  filter: any,
  options: IOptions
) => {
  const { page, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { ...filterData } = filter;
  const andConditions: Prisma.AppointmentWhereInput[] = [];
  if (user.role === UserRole.PATIENT) {
    andConditions.push({
      patient: {
        email: user.email,
      },
    });
  } else if (user.role === UserRole.DOCTOR) {
    andConditions.push({
      doctor: {
        email: user.email,
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: filterData[key] },
      })),
    });
  }
  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include:
      user.role === UserRole.DOCTOR ? { patient: true } : { doctor: true },
  });
  const total = await prisma.appointment.count({
    where: whereConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  user: JwtPayload
) => {
  const isAppointmentExist = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: { doctor: true },
  });
  if (user.role === UserRole.DOCTOR) {
    if (isAppointmentExist.doctor.email !== user.email) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You can't change the status of this appointment"
      );
    }
  }
  return await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status,
    },
  });
};

export const AppointmentServices = {
  createAppointment,
  getAllMyAppointments,
  updateAppointmentStatus,
};
