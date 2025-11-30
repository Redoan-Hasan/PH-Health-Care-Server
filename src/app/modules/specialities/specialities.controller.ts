import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { SpecialtiesServices } from "./specialities.services";

const createSpecialities = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialtiesServices.createSpecialities(req);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Specialties created successfully!",
        data: result
    });
});

const getAllSpecialities = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialtiesServices.getAllSpecialities();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Specialties data fetched successfully',
        data: result,
    });
});

const deleteSpecialities = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SpecialtiesServices.deleteSpecialities(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Specialty deleted successfully',
        data: result,
    });
});

export const SpecialitiesController = {
    createSpecialities,
    getAllSpecialities,
    deleteSpecialities,
};