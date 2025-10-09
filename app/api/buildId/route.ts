import { BUILD_ID } from "@/lib/config";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ buildId: BUILD_ID });
}
