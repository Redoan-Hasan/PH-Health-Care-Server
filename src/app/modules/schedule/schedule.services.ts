import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../shared/prisma";
import { ISchedule } from "./schedule.interface";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

const createSchedule = async (payload: any) => {
  const { startDate, endDate, startTime, endTime } = payload;
  const intervalTime = 30;
  const schedules: ISchedule[] = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  // console.log("startDate", startDate);
  // console.log("currentDate", currentDate);
  // console.log("endDate", endDate);
  // console.log("lastDate", lastDate);

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );
    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );
    while (startDateTime < endDateTime) {
      const slotStartDateTime = startDateTime;
      const slotEndDateTime = addMinutes(startDateTime, intervalTime);
      const scheduleData = {
        startDateTime: slotStartDateTime,
        endDateTime: slotEndDateTime,
      };
      const existingSchedule = await prisma.schedule.findFirst({
        where: scheduleData,
      });
      if (!existingSchedule) {
        const result = await prisma.schedule.create({ data: scheduleData });
        schedules.push(result);
      }
      slotStartDateTime.setMinutes(
        slotStartDateTime.getMinutes() + intervalTime
      );
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

const schedulesForDoctor = async (
  options: IOptions,
  filter: any,
  user: JwtPayload
) => {
  const { page, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { startDateTime, endDateTime } = filter;
  const andConditions: Prisma.ScheduleWhereInput[] = [];

  if (startDateTime && endDateTime) {
    andConditions.push({
      AND: [
        { startDateTime: { gte: startDateTime } },
        { endDateTime: { lte: endDateTime } },
      ],
    });
  }

  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user.email,
      },
    },
    select: {
      scheduleId: true,
    },
  });
  const doctorSchedulesIds = doctorSchedules.map(
    (schedule) => schedule.scheduleId
  );
  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.schedule.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: {
      ...whereConditions,
      id: {
        notIn: doctorSchedulesIds,
      },
    },
    orderBy: { [sortBy]: sortOrder },
  });
  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorSchedulesIds,
      },
    },
  });
  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const deleteSchedule = async (id: string) => {
  const result = await prisma.schedule.delete({
    where: {
      id: id,
    },
  });
  return result;
};

export const ScheduleServices = {
  createSchedule,
  schedulesForDoctor,
  deleteSchedule,
};
