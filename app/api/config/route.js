export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey) {
      throw new Error('API key is required');
    }

    // Store the API key in a cookie
    const response = Response.json({ success: true });
    response.cookies.set('prompt_api_key', apiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;
  } catch (error) {
    console.error('Error setting API key:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const apiKey = request.cookies.get('prompt_api_key')?.value;
    return Response.json({ apiKey });
  } catch (error) {
    console.error('Error getting API key:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 