import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { name } = await request.json();
    const cookieStore = cookies();
    const domain = cookieStore.get('prompt_domain')?.value;
    const apiKey = cookieStore.get('prompt_api_key')?.value;
    
    if (!name) {
      throw new Error('List name is required');
    }

    if (!domain) {
      throw new Error('Domain not set. Please set your domain first.');
    }

    if (!apiKey) {
      throw new Error('API key not set. Please set your API key first.');
    }

    console.log('Using domain:', domain);
    console.log('Using API key:', apiKey ? 'API key present' : 'No API key');

    const response = await fetch(`https://${domain}.prompt.io/rest/1.0/contact_lists`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'orgAuthToken': apiKey,
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
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to create contact list: ${response.statusText}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error creating contact list:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 