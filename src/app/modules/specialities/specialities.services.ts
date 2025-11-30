import { Request } from "express";
import { fileUploader } from "../../helper/fileUploader";
import { prisma } from "../../shared/prisma";
import { Specialities } from "@prisma/client";

const createSpecialities = async (req: Request) => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloundinary(file);
    req.body.icon = uploadToCloudinary?.secure_url;
  }

  const result = await prisma.specialities.create({
    data: req.body,
  });

  return result;
};

const getAllSpecialities = async (): Promise<Specialities[]> => {
  return await prisma.specialities.findMany();
};

const deleteSpecialities = async (id: string): Promise<Specialities> => {
  const result = await prisma.specialities.delete({
    where: {
      id,
    },
  });
  return result;
};

export const SpecialtiesServices = {
  createSpecialities,
  getAllSpecialities,
  deleteSpecialities,
};
