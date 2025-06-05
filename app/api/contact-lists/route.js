export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { name } = await request.json();
    
    if (!name) {
      throw new Error('List name is required');
    }

    const response = await fetch('https://jeremy.prompt.io/rest/1.0/contact_lists', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'orgAuthToken': process.env.PROMPT_IO_AUTH_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        apiId: name.replace(/\s+/g, '_'),
        icon: "",
        description: "Additional numbers found in NGP VAN"
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create contact list: ${response.statusText}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error creating contact list:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 