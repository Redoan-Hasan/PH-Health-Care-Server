import httpStatus  from 'http-status';
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "./jwt";
import config from "../../config";
import { JwtPayload } from "jsonwebtoken";
import ApiError from '../../errorHelpers/ApiError';

export const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        throw new Error("Unauthorized");
      }
      const verifyUser = verifyToken(
        token,
        config.jwt.access_token_secret as string
      ) as JwtPayload;
      if (!verifyUser) {
        throw new ApiError(httpStatus.UNAUTHORIZED,"Invalid Token");
      }
      if (roles.length && !roles.includes(verifyUser.role)) {
        throw new Error("Forbidden");
      }
      req.user = verifyUser;
      next();
    } catch (error) {
      next(error);
    }
  };
};
