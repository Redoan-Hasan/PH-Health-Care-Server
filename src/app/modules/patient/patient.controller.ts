import { Request, Response } from "express";
import httpStatus from "http-status";
import { pick } from "../../helper/pick";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { patientFilterableFields } from "./patient.constant";
import { PatientServices } from "./patient.services";
import { JwtPayload } from "jsonwebtoken";

const getAllPatients = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, patientFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await PatientServices.getAllPatients(filter, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patients retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getPatientById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientServices.getPatientById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient retrieved successfully",
    data: result,
  });
});

const updatePatient = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {
  const user = req.user;
  const result = await PatientServices.updatePatient(user as JwtPayload, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient updated successfully",
    data: result,
  });
});

const deletePatient = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientServices.deletePatient(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

export const PatientController = {
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
