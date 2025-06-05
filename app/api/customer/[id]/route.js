import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log('Fetching details for customer:', id);

    const cookieStore = cookies();
    const domain = cookieStore.get('prompt_domain')?.value;
    const apiKey = cookieStore.get('prompt_api_key')?.value;

    if (!domain) {
      throw new Error('Domain not set. Please set your domain first.');
    }

    if (!apiKey) {
      throw new Error('API key not set. Please set your API key first.');
    }

    console.log('Making request with:', {
      domain,
      hasApiKey: !!apiKey,
      customerId: id
    });

    const response = await fetch(`https://${domain}.prompt.io/rest/1.0/data/customer/${id}`, {
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
      throw new Error(`Failed to fetch customer details: ${response.statusText}`);
    }

    const details = await response.json();
    console.log('Retrieved customer details:', details);
    
    return Response.json(details);
  } catch (error) {
    console.error('Error in customer details API route:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    return Response.json(
      { 
        error: error.message || 'Failed to fetch customer details',
        details: error.stack
      },
      { status: 500 }
    );
  }
} 