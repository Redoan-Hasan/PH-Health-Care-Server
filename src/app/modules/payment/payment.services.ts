import { Request } from "express";
import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";

const webhook = async (req: Request) => {
  const event = req.body;
  const { appointmentId } = event.data.object.metadata;

  if (event.type === "checkout.session.completed") {
    await prisma.payment.update({
      where: {
        appointmentId: appointmentId,
      },
      data: {
        status: PaymentStatus.PAID,
        transactionId: event.data.object.payment_intent,
      },
    });
  }

  return { received: true };
};

export const PaymentServices = {
  webhook,
};