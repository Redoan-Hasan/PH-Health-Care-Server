import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  brcypt_sault_rounds: parseInt(process.env.BYCRYPT_SALT_ROUNDS as string),
  CLOUDINARY: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  jwt: {
    access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    access_token_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  },
  open_router_api_key: process.env.OPEN_ROUTER_API_KEY,
};
