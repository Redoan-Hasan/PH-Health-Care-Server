import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DoctorServices } from "./doctor.services";
import { doctorFilterableFields } from "./doctor.constant";
import { pick } from "../../helper/pick";

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, doctorFilterableFields);
    const options = pick(req.query, [ "page", "limit","sortBy", "sortOrder"]);
  const result = await DoctorServices.getAllDoctors(filter,options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctors data fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorServices.updateDoctor(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor data updated successfully",
    data: result,
  });
});

export const DoctorController = {
  getAllDoctors,
  updateDoctor,
};

