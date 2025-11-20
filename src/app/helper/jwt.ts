import { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from 'jsonwebtoken';
export const generateJWTToken = (payload: JwtPayload, secret: string, expiresIn: string) =>{
    return jwt.sign(payload, secret, {
        expiresIn,
    } as SignOptions);
}

export const verifyToken = (token : string, token_secret : string) =>{
    return jwt.verify(token, token_secret);
}