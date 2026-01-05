import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { ENV } from "./env";

export interface SupabaseContext {
  userId: string | null;
  user: any | null;
  req: Request;
  res: Response;
}

export async function createSupabaseContext(req: Request, res: Response): Promise<SupabaseContext> {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.auth_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return {
        userId: null,
        user: null,
        req,
        res,
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, ENV.jwtSecret || "your-secret-key") as any;

    return {
      userId: decoded.userId,
      user: {
        id: decoded.userId,
        email: decoded.email,
      },
      req,
      res,
    };
  } catch (error) {
    console.error("Context creation error:", error);
    return {
      userId: null,
      user: null,
      req,
      res,
    };
  }
}
