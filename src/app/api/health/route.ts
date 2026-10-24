import { NextResponse } from "next/server";
import { loadEnv } from "@/server/env";

export async function GET() {
  try {
    const env = loadEnv(process.env);
    return NextResponse.json({
      status: "ok",
      env: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: (error as Error).message },
      { status: 503 },
    );
  }
}