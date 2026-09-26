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
router.get(
    "/",
    auth(UserRole.PATIENT),
    PrescriptionController.myPrescriptions
);

export const PrescriptionRoutes = router;
