import { Gender } from "@prisma/client";

export interface IDoctorUpdateWithSpecialities{
    name: string;
    email: string;
    profilePhoto: string | null;
    contactNumber: string;
    address: string;
    registrationNumber: string;
    experience: number;
    gender: Gender;
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    specialities: {
        specialityId:string;
        isDeleted?: boolean;
    }[];
}