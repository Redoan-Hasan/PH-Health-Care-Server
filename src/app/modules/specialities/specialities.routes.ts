import express, { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../helper/fileUploader";
import { SpecialitiesController } from "./specialities.controller";
import { SpecialtiesZodSchema } from "./specialities.zod";
import { auth } from "../../helper/auth";

const router = express.Router();

router.get("/", SpecialitiesController.getAllSpecialities);

router.post(
  "/create",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialtiesZodSchema.create.parse(JSON.parse(req.body.data));
    return SpecialitiesController.createSpecialities(req, res, next);
  }
);
router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.ADMIN),
  SpecialitiesController.deleteSpecialities
);

export const SpecialitiesRoutes = router;
