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
    console.log('Raw API response:', JSON.stringify(data, null, 2));

    // Extract the contactLists array from the response
    const lists = data.contactLists || [];
    console.log('Processed lists:', JSON.stringify(lists, null, 2));
    
    // Log each list's name for debugging
    lists.forEach((list, index) => {
      console.log(`List ${index}:`, {
        name: list.name,
        apiId: list.apiId,
        id: list.id
      });
    });

    return Response.json(lists);
  } catch (error) {
    console.error('Error fetching contact lists:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 