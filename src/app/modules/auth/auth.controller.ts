import httpStatus from 'http-status';
import catchAsync from "../../shared/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../shared/sendResponse";
import { AuthServices } from './auth.services';

const login = catchAsync(async(req:Request, res:Response)=>{
    const result = await AuthServices.login(req.body);
    if (result.accessToken) {
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }
  if (result.refreshToken) {
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success:true,
        message:"User logged in successfully",
        data:{
            needPasswordChange:result.needPasswordChange,
        }
    });
});

export const AuthController={
    login,
};