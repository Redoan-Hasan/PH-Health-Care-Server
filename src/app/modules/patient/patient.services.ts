import { Patient, Prisma, UserStatus } from "@prisma/client";
import { paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import { patientSearchableFields } from "./patient.constant";
import { IPatientFilterRequest } from "./patient.interface";
import { IOptions } from "../../helper/paginationHelper";
import { JwtPayload } from "jsonwebtoken";

const getAllPatients = async (
  filter: IPatientFilterRequest,
  options: IOptions,
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filter;

  const andConditions: Prisma.PatientWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : { isDeleted: false };

  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
    include: {
      patientHealthData: true,
      medicalReports: true,
    },
  });
  const total = await prisma.patient.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getPatientById = async (id: string) => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      patientHealthData: true,
      medicalReports: true,
    },
  });
  return result;
};

const updatePatient = async (user: JwtPayload, payload: any) => {
  const { patientData, patientHealthData, medicalReport } = payload;
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });
  console.log(patientInfo);
  return await prisma.$transaction(async (transaction) => {
    if (patientData) {
      await transaction.patient.update({
        where: {
          id: patientInfo.id,
        },
        data: patientData,
      });
    }
    if (patientHealthData) {
      await transaction.patientHealthData.upsert({
        where: {
          patientId: patientInfo.id,
        },
        update: patientHealthData,
        create: {
          ...patientHealthData,
          patientId: patientInfo.id,
        },
      });
    }
    if (medicalReport) {
      await transaction.medicalReport.create({
        data: {
          ...medicalReport,
          patientId: patientInfo.id,
        },
      });
    }

    const result = await transaction.patient.findUnique({
      where: {
        id: patientInfo.id,
      },
      include: {
        patientHealthData: true,
        medicalReports: true,
      },
    });
    return result;
  });
};

const deletePatient = async (id: string) => {
  const result = await prisma.$transaction(async (transaction) => {
    const deletedPatient = await transaction.patient.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await transaction.user.update({
      where: { email: deletedPatient.email },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedPatient;
  });
  return result;
};

export const PatientServices = {
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
