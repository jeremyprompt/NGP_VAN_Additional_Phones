import PromptIoClient from '@/lib/promptio';

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log('Fetching details for customer:', id);

    if (!process.env.PROMPT_IO_AUTH_TOKEN) {
      throw new Error('PROMPT_IO_AUTH_TOKEN is not configured');
    }

    const client = new PromptIoClient();
    const details = await client.getCustomerDetails(id);
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