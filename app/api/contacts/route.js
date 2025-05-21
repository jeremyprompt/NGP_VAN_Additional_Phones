import { NextResponse } from "next/server";
import { ngpvan } from "@/lib/ngpvan";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    if (process.env.NODE_ENV === "production" && !process.env.NGP_VAN_AUTH_TOKEN) {
      return NextResponse.json({ error: "NGP VAN credentials are not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
    }

    const response = await ngpvan.getPeople({
      firstName,
      lastName,
      $expand: "Phones"
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch contact information" }, { status: 500 });
  }
}
