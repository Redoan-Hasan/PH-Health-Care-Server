import { Doctor, Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import { IDoctorUpdateWithSpecialities } from "./doctor.interface";

const getAllDoctors = async (
  filter: any,
  options: IOptions
): Promise<
  { data: Doctor[] } & { meta: { page: number; limit: number; total: number } }
> => {
  const { page, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, specialities, ...filterData } = filter;
  const andConditions: Prisma.DoctorWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }
  if (specialities && specialities.length > 0) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialities: {
            title: {
              contains: specialities,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: filterData[key] },
      })),
    });
  }
  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });
  const total = await prisma.doctor.count({
    where: { AND: andConditions },
  });
  return {
    data: result,
    meta: {
      page,
      limit,
      total,
    },
  };
};

const updateDoctor = async (
  id: string,
  payload: Partial<IDoctorUpdateWithSpecialities>
) => {
  const { specialities, ...doctorData } = payload;
  const doctorInfo = await prisma.doctor.findFirstOrThrow({
    where: { id },
  });
  return await prisma.$transaction(async (transaction) => {
    if (specialities && specialities.length > 0) {
      const deleteSpecialitiesIds = specialities.filter(
        (speciality) => speciality.isDeleted
      );
      for (const deleteSpeciality of deleteSpecialitiesIds) {
        await transaction.doctorSpecialities.deleteMany({
          where: {
            doctorId: doctorInfo.id,
            specialitiesId: deleteSpeciality.specialityId,
          },
        });
      }
      const createSpecialitiesIds = specialities.filter(
        (speciality) => !speciality.isDeleted
      );
      for (const createSpeciality of createSpecialitiesIds) {
        await transaction.doctorSpecialities.create({
          data: {
            doctorId: id,
            specialitiesId: createSpeciality.specialityId,
          },
        });
      }
    }
    const result = await transaction.doctor.update({
      where: { id },
      data: doctorData,
      include: {
        doctorSpecialties: {
          include: {
            specialities: true,
          },
        },
      },
    });
    return result;
  });
};

export const DoctorServices = {
  getAllDoctors,
  updateDoctor,
};
