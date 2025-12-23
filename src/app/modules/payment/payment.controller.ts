import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { Request, Response } from "express";
import { PaymentServices } from "./payment.services";

const webhook = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.webhook(req);
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
