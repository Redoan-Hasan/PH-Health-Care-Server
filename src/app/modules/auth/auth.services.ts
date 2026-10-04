import { verifyToken } from './../../helper/jwt';
import bcrypt from "bcryptjs";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { UserStatus } from "@prisma/client";
import { generateJWTToken } from "../../helper/jwt";
import { JwtPayload, Secret } from 'jsonwebtoken';
const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  const isPasswordCorrect = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isPasswordCorrect) throw new Error("password incorrect");
  const accessToken = generateJWTToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.access_token_secret as string,
    config.jwt.access_token_expires_in as string
  );

  const refreshToken = generateJWTToken(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    config.jwt.refresh_token_secret as string,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

const getMe = async (session: any) => {
    const accessToken = session.accessToken;
    const decodedData = verifyToken(accessToken, config.jwt.access_token_secret as string) as JwtPayload;
    console.log("decoded Data", decodedData);

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        }
    })

    const { id, email, role, needPasswordChange, status } = userData;

    return {
        id,
        email,
        role,
        needPasswordChange,
        status
    }

}

export const AuthServices = {
  login,
  getMe,
};
