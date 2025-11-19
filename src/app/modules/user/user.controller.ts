import httpStatus from 'http-status';
import catchAsync from "../../shared/catchAsync";
import { Request, Response } from "express";
import { UserServices } from "./user.services";
import sendResponse from "../../shared/sendResponse";

const createPatient = catchAsync(async(req:Request, res:Response)=>{
    const result = await UserServices.createPatient(req);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success:true,
        message:"User created successfully",
        data:result
    });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {

    const result = await UserServices.createAdmin(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Admin Created successfuly!",
        data: result
    })
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {

    const result = await UserServices.createDoctor(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Doctor Created successfuly!",
        data: result
    })
});

export const UserController={
    createPatient,
    createAdmin,
    createDoctor
};