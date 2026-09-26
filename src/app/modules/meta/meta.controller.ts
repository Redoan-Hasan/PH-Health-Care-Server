import httpStatus from 'http-status';
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from '../../shared/sendResponse';
import { MetaServices } from './meta.services';

const fetchDashboardMetaData = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
    const user = req.user;
    const result = await MetaServices.fetchDashboardMetaData(user as JwtPayload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Meta data retrival successfully!",
        data: result
    })
});

export const MetaController = {
    fetchDashboardMetaData
}