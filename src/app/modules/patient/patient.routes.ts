import express from "express";
import { PatientController } from "./patient.controller";
import { auth } from "../../helper/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", PatientController.getAllPatients);
router.patch("/", auth(UserRole.PATIENT), PatientController.updatePatient);
router.get("/:id", PatientController.getPatientById);
router.delete("/:id", PatientController.deletePatient);

export const PatientRoutes = router;
