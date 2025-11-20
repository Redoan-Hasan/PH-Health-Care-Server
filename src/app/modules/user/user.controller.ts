import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import { Request, Response } from "express";
import { UserServices } from "./user.services";
import sendResponse from "../../shared/sendResponse";
import { pick } from "../../helper/pick";

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createPatient(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createAdmin(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin Created successfuly!",
    data: result,
  });
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createDoctor(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor Created successfuly!",
    data: result,
  });
});
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  // const page = Number(req.query.page) || 1;
  // const limit = Number(req.query.limit) || 10;
  // const searchTerm = req.query.searchTerm as string;
  // const sortBy = req.query.sortBy as string;
  // const sortOrder = req.query.sortOrder as "asc" | "desc";
  const filter = pick(req.query, ["role","status","searchTerm","email"]);
  const options = pick(req.query, [ "page", "limit","sortBy", "sortOrder"]);
  // console.log(options);
  const result = await UserServices.getAllUsers(options, filter);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "All Users retrieved successfuly!",
    data: result.data,
    meta:result.meta
  });
});

export const UserController = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllUsers,
};
