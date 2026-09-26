import { Router } from "express";
import { ReviewController } from "./review.controller";
import { auth } from "../../helper/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
    "/",
    auth(UserRole.PATIENT),
    ReviewController.createReview
);

router.get(
    "/",
    ReviewController.getAllReviews
);

export const ReviewRoutes = router;
