import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const domain = cookieStore.get('prompt_domain')?.value;
    const apiKey = cookieStore.get('prompt_api_key')?.value;

    if (!domain) {
      throw new Error('Domain not set. Please set your domain first.');
    }

    if (!apiKey) {
      throw new Error('API key not set. Please set your API key first.');
    }

    console.log('Using domain:', domain);
    console.log('Using API key:', apiKey ? 'API key present' : 'No API key');

    const response = await fetch(`https://${domain}.prompt.io/rest/1.0/contact_lists`, {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
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
    console.error('Error checking contact lists:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 