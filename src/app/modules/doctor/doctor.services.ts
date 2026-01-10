import httpStatus from "http-status";
import { Doctor, Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import { IDoctorUpdateWithSpecialities } from "./doctor.interface";
import ApiError from "../../../errorHelpers/ApiError";
import { openai } from "../../helper/OpenRouter";
import { extractJsonFromMessage } from "../../helper/extractMessageFromJSON";

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
      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
      reviews: {
        select: {
          rating: true,
          comment: true,
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
  console.log(payload, id);
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

const getAiSuggestions = async (payload: { symptoms: string }) => {
  if (!(payload && payload.symptoms)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Symptoms are required for AI suggestions"
    );
  }
  const doctors = await prisma.doctor.findMany({
    where: { isDeleted: false },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });

  console.log("doctors data loaded.......\n");
  const prompt = `
You are a medical assistant AI. Based on the patient's symptoms, suggest the top 3 most suitable doctors.
Each doctor has specialties and years of experience.
Only suggest doctors who are relevant to the given symptoms.

Symptoms: ${payload.symptoms}

Here is the doctor list (in JSON):
${JSON.stringify(doctors, null, 2)}

Return your response in JSON format with full individual doctor data. 
`;

  console.log("analyzing......\n");
  const completion = await openai.chat.completions.create({
    model: "z-ai/glm-4.5-air:free",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI medical assistant that provides doctor suggestions.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  // console.log(completion.choices[0].message);
  const result = await extractJsonFromMessage(completion.choices[0].message);
  return result;
};

const getDoctorById = async (id: string) => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
      reviews: true,
    },
  });
  return result;
};

export const DoctorServices = {
  getAllDoctors,
  updateDoctor,
  getAiSuggestions,
  getDoctorById,
};
