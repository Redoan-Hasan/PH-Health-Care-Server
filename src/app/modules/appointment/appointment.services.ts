import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../shared/prisma";
import { v4 as uuidv4 } from "uuid";
import { stripe } from "../../helper/stripe";

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
    await tnx.payment.create({
      data:{
        appointmentId: appointment.id,
        amount: doctorData.appointmentFee,
        transactionId,
      }
    })
     const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',             product_data: {
              name: `Appointment with Dr. ${doctorData.name}`,
              description: `Appointment for ${patientData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://bindu-logic-clone.vercel.app`,
      cancel_url: `https://arthub-d9977.web.app`,
      metadata: {
        appointmentId: appointment.id,
        patientId: patientData.id,
        doctorId: doctorData.id,
      },
    });
    console.log(session)
    return appointment;
  });
  return result;
};

export const AppointmentServices = {
  createAppointment,
};
