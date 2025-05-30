export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const { listId } = params;
    const { identityType, contacts } = await request.json();

    const response = await fetch(`https://jeremy.prompt.io/rest/1.0/contact_lists/${listId}/contacts`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'orgAuthToken': process.env.PROMPT_IO_AUTH_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identityType,
        contacts
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to add contacts to list: ${response.statusText}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error adding contacts to list:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 