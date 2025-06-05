import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');
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

    let url = `https://${domain}.prompt.io/rest/1.0/contacts`;
    if (listId) {
      url = `https://${domain}.prompt.io/rest/1.0/contact_lists/${listId}/contacts`;
    }

    const response = await fetch(url, {
      headers: {
        'accept': '*/*',
        'orgAuthToken': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
