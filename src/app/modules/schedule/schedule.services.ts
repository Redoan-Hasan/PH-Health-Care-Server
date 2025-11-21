import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../shared/prisma";
import { ISchedule } from "./schedule.interface";

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

export const ScheduleServices = {
  createSchedule,
};
