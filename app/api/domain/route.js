import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { domain } = await request.json();
    
    if (!domain) {
      throw new Error('Domain is required');
    }

    // Store the domain in a cookie
    cookies().set('prompt_domain', domain, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error setting domain:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const domain = cookies().get('prompt_domain')?.value;
    return Response.json({ domain });
  } catch (error) {
    console.error('Error getting domain:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 