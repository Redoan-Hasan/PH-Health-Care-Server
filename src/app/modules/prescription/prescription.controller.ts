import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PrescriptionServices } from "./prescription.services";
import { JwtPayload } from "jsonwebtoken";

const createPrescription = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
    const user = req.user;
    const result = await PrescriptionServices.createPrescription(user as JwtPayload, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Prescription created successfully!",
        data: result
    });
});

export const PrescriptionController = {
    createPrescription,
};
