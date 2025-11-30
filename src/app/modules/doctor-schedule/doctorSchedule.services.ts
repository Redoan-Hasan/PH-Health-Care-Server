import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../shared/prisma";

const insertSchedulesForDoctor = async (user: JwtPayload, payload: {
    scheduleIds: string[],
}) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
    //   id: user.id,
      email: user.email,
    },
  });
  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }))
  return await prisma.doctorSchedules.createMany({
      data: doctorScheduleData,
  });
};

export const doctorScheduleServices = {
  insertSchedulesForDoctor,
};
