import { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from 'jsonwebtoken';
export const generateJWTToken = (payload: JwtPayload, secret: string, expiresIn: string) =>{
    return jwt.sign(payload, secret, {
        expiresIn,
    } as SignOptions);
}
