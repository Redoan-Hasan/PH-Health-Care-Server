import { Router } from "express";
import { PrescriptionController } from "./prescription.controller";
import { auth } from "../../helper/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
    "/",
    auth(UserRole.DOCTOR),
    PrescriptionController.createPrescription
);

export const PrescriptionRoutes = router;
