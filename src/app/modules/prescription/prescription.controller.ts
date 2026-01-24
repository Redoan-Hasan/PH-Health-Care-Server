import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PrescriptionServices } from "./prescription.services";
import { JwtPayload } from "jsonwebtoken";
import { pick } from "../../helper/pick";

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
const myPrescriptions = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
    const user = req.user;
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = await PrescriptionServices.myPrescriptions(user as JwtPayload, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your prescriptions retrieved successfully!",
        meta: result.meta,
        data: result.data
    });
});

export const PrescriptionController = {
    createPrescription,
    myPrescriptions,
};
