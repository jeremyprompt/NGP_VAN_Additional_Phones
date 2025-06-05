import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');
    const first = parseInt(searchParams.get('first') || '0');
    const max = parseInt(searchParams.get('max') || '200');
    
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
    console.log('Pagination params:', { first, max });

    // If no listId is provided, fetch contact lists instead of contacts
    if (!listId) {
      console.log('Fetching contact lists');
      const response = await fetch(`https://${domain}.prompt.io/rest/1.0/contact_lists`, {
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
        throw new Error(`Failed to fetch contact lists: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received lists data:', data);
      return Response.json({ lists: data });
    }

    // If listId is provided, fetch contacts for that list with pagination
    console.log(`Fetching contacts for list ${listId} (first: ${first}, max: ${max})`);
    const response = await fetch(
      `https://${domain}.prompt.io/rest/1.0/contact_lists/${listId}/contacts?first=${first}&max=${max}`,
      {
        headers: {
          'accept': '*/*',
          'orgAuthToken': apiKey
        }
      }
    );

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
    console.log('Received contacts data:', {
      count: data.count,
      received: data.customerContacts?.length || 0,
      first,
      max
    });
    return Response.json({ contacts: data });
  } catch (error) {
    console.error('Error fetching data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
