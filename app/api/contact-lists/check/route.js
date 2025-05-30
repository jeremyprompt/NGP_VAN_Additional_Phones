export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch('https://jeremy.prompt.io/rest/1.0/contact_lists?first=0&max=200', {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'orgAuthToken': process.env.PROMPT_IO_AUTH_TOKEN
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch contact lists: ${response.statusText}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching contact lists:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 