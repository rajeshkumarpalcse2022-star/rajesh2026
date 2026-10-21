import { NextResponse } from "next/server";
import { adminEmail } from "@/lib/admin-auth";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-guard";

export async function GET() {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  return NextResponse.json({ email: adminEmail() });
}
