import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../shared/prisma";
import ApiError from "../../../errorHelpers/ApiError";

const createReview = async (user: JwtPayload, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });

  if (appointmentData.patientId !== patientData.id) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You are not authorized to review for this appointment"
    );
  }

  return await prisma.$transaction(async (tnx) => {
    const result = await prisma.review.create({
      data: {
        appointmentId: appointmentData.id,
        doctorId: appointmentData.doctorId,
        rating: payload.rating,
        comment: payload.comment,
        patientId: patientData.id,
      },
    });

    const avgRating = await tnx.review.aggregate({
      where: {
        doctorId: appointmentData.doctorId,
      },
      _avg: {
        rating: true,
      },
    });
    await tnx.doctor.update({
      where: {
        id: appointmentData.doctorId,
      },
      data: {
        averageRating: avgRating._avg.rating as number,
      },
    });
    return result;
  });
};

const getAllReviews = async () => {
  return await prisma.review.findMany({
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });
};

export const ReviewServices = {
  createReview,
  getAllReviews,
};
