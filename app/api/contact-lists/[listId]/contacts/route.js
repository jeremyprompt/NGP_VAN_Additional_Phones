export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const { listId } = params;
    const { identityType, contacts } = await request.json();
    
    // Validate the request data
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      throw new Error('Invalid contacts data: contacts must be a non-empty array');
    }

    // Validate each contact
    contacts.forEach((contact, index) => {
      if (!contact.identityKey || !contact.displayName) {
        throw new Error(`Invalid contact at index ${index}: must have identityKey and displayName`);
      }
    });

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
      const errorText = await response.text();
      throw new Error(`Failed to add contacts to list: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error adding contacts to list:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 