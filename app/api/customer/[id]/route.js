import PromptIoClient from '@/lib/promptio';

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    console.log('Environment check:', {
      hasAuthToken: !!process.env.PROMPT_IO_AUTH_TOKEN,
      nodeEnv: process.env.NODE_ENV
    });

    if (!process.env.PROMPT_IO_AUTH_TOKEN) {
      throw new Error('PROMPT_IO_AUTH_TOKEN is not configured');
    }

    const customerId = params.id;
    console.log('Fetching details for customer:', customerId);

    const client = new PromptIoClient();
    const details = await client.getCustomerDetails(customerId);
    
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