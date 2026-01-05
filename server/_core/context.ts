import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import * as jwt from "jsonwebtoken";
import { ENV } from "./env";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  userId: string | null;
  user: any | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let userId: string | null = null;
  let user: any = null;

  try {
    // Get token from cookies or Authorization header
    const token = opts.req.cookies?.auth_token || opts.req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, ENV.jwtSecret || "your-secret-key") as any;
      userId = decoded.userId;
      user = {
        id: decoded.userId,
        email: decoded.email,
      };
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    userId = null;
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    userId,
    user,
  };
}
