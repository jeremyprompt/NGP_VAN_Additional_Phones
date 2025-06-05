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

    // Initialize variables for pagination
    let allLists = [];
    let first = 0;
    const max = 200;
    let hasMore = true;

    // Fetch all lists using pagination
    while (hasMore) {
      const url = `https://${domain}.prompt.io/rest/1.0/contact_lists?first=${first}&max=${max}`;
      console.log('Fetching contact lists from URL:', url);

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
          error: errorText,
          url
        });
        throw new Error(`Failed to fetch contact lists: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw API response:', JSON.stringify(data, null, 2));

      // Extract the contactLists array from the response
      const lists = data.contactLists || [];
      const count = data.count || 0;
      
      console.log('Pagination details:', {
        first,
        max,
        received: lists.length,
        total: count,
        hasMore: lists.length > 0
      });

      // Add the lists from this page to our collection
      allLists = [...allLists, ...lists];

      // Check if we've received all lists
      if (lists.length === 0 || allLists.length >= count) {
        hasMore = false;
      } else {
        first += max;
      }
    }

    console.log('Total lists found:', allLists.length);
    
    // Log each list's name for debugging
    allLists.forEach((list, index) => {
      console.log(`List ${index}:`, {
        name: list.name,
        apiId: list.apiId,
        id: list.id
      });
    });

    return Response.json(allLists);
  } catch (error) {
    console.error('Error checking contact lists:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 