import { Router, Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import { supabaseAdmin } from "./supabase";
import { createUser, getUserByEmail } from "./supabase";
import * as jwt from "jsonwebtoken";
import { ENV } from "./_core/env";

const router = Router();

// Sign up endpoint
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase
    const user = await createUser(email, hashedPassword, name);
    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      ENV.jwtSecret || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Login endpoint
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Get user from Supabase
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    const userWithPassword = await supabaseAdmin
      .from("users")
      .select("password_hash")
      .eq("id", user.id)
      .single();
    
    const passwordHash = (userWithPassword.data as any)?.password_hash;
    const isPasswordValid = await bcrypt.compare(password, passwordHash || "");
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      ENV.jwtSecret || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Logout endpoint
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({ success: true });
});

// Get current user endpoint
router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(
      token,
      ENV.jwtSecret || "your-secret-key"
    ) as any;

    // Get user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
      weight_unit: user.weight_unit,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
