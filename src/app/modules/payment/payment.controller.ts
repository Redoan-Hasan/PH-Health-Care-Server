import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { Request, Response } from "express";
import { PaymentServices } from "./payment.services";
import { stripe } from "../../helper/stripe";

const webhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret =
    "whsec_a54bd75bd4c6f05c670ee0dd914b3c9387c765422d7344ae1b7b9e30456f45dc";
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  const result = await PaymentServices.webhook(event);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Webhook received successfully!",
    data: result,
  });
});

export const PaymentController = {
  webhook,
};
