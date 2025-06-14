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

    console.log('Request details:', {
      url: request.url,
      listId,
      first,
      max,
      domain,
      hasApiKey: !!apiKey
    });

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
    const contactsUrl = `https://${domain}.prompt.io/rest/1.0/contact_lists/${listId}/contacts?first=${first}&max=${max}`;
    console.log('Fetching contacts from URL:', contactsUrl);
    
    const response = await fetch(contactsUrl, {
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
        error: errorText,
        url: contactsUrl
      });
      throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw API Response:', JSON.stringify(data, null, 2));
    
    // Check if the response structure is different
    const contacts = data.customerContacts || data.contacts || [];
    const count = data.count || data.totalCount || 0;
    
    console.log('Processed contacts data:', {
      count,
      received: contacts.length,
      hasContacts: contacts.length > 0,
      first,
      max,
      url: contactsUrl,
      responseKeys: Object.keys(data)
    });

    return Response.json({ 
      contacts: {
        count,
        customerContacts: contacts
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
