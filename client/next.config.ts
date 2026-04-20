import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

try {
  const loginPath = path.join(process.cwd(), "app", "login");
  const signupPath = path.join(process.cwd(), "app", "signup");
  if (fs.existsSync(loginPath)) {
    console.log("Removing duplicate app/login directory...");
    fs.rmSync(loginPath, { recursive: true, force: true });
  }
  if (fs.existsSync(signupPath)) {
    console.log("Removing duplicate app/signup directory...");
    fs.rmSync(signupPath, { recursive: true, force: true });
  }
} catch (e) {
  // Ignore errors to not crash Next config
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
