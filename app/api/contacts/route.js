import { NextResponse } from "next/server";
import { ngpvan } from "@/lib/ngpvan";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // Log environment variables (without sensitive data)
    console.log('Environment check:', {
      hasUsername: !!process.env.NGP_VAN_USERNAME,
      hasPassword: !!process.env.NGP_VAN_PASSWORD,
      nodeEnv: process.env.NODE_ENV
    });

    if (process.env.NODE_ENV === "production" && (!process.env.NGP_VAN_USERNAME || !process.env.NGP_VAN_PASSWORD)) {
      return NextResponse.json({ error: "NGP VAN credentials are not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');

    console.log('Search params:', { firstName, lastName });

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
    }

    try {
      const { data } = await ngpvan.getPeople({
        firstName,
        lastName,
        $expand: "Phones"
      });

      return NextResponse.json(data);
    } catch (apiError) {
      console.error("NGP VAN API Error:", {
        message: apiError.message,
        stack: apiError.stack
      });
      return NextResponse.json({ 
        error: "Failed to fetch contact information",
        details: apiError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("General API Error:", {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: "Failed to process request",
      details: error.message 
    }, { status: 500 });
  }
}
