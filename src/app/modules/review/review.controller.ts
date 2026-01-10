import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { ReviewServices } from "./review.services";
import { JwtPayload } from "jsonwebtoken";

const createReview = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
    const user = req.user;
    const result = await ReviewServices.createReview(user as JwtPayload, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Review created successfully!',
        data: result,
    });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewServices.getAllReviews();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews fetched successfully!',
        data: result,
    });
});

export const ReviewController = {
    createReview,
    getAllReviews
};
