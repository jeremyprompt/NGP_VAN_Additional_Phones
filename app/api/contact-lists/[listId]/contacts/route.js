import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const { listId } = params;
    const { identityType, contacts } = await request.json();
    
    const cookieStore = cookies();
    const domain = cookieStore.get('prompt_domain')?.value;
    const apiKey = cookieStore.get('prompt_api_key')?.value;

    if (!domain) {
      throw new Error('Domain not set. Please set your domain first.');
    }

    if (!apiKey) {
      throw new Error('API key not set. Please set your API key first.');
    }
    
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
    
    console.log('Adding contacts to list:', {
      listId,
      identityType,
      contacts,
      domain,
      hasApiKey: !!apiKey
    });

    const requestBody = {
      identityType,
      contacts
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`https://${domain}.prompt.io/rest/1.0/contact_lists/${listId}/contacts`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'orgAuthToken': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to add contacts:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        requestBody
      });
      throw new Error(`Failed to add contacts to list: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully added contacts:', data);
    return Response.json(data);
  } catch (error) {
    console.error('Error adding contacts to list:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 