import PromptIoClient from '@/lib/promptio';

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log('Fetching details for customer:', id);

    const response = await fetch(`https://jeremy.prompt.io/rest/1.0/data/customer/${id}`, {
      headers: {
        'accept': '*/*',
        'orgAuthToken': 'agedUcuLSy0doGwKbbQaOTFIQ4LctSzp2J'
      }
    });

    if (!response.ok) {
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