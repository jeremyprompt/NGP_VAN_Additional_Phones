import PromptIoClient from '@/lib/promptio';

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    console.log('Environment check:', {
      hasAuthToken: !!process.env.PROMPT_IO_AUTH_TOKEN,
      nodeEnv: process.env.NODE_ENV
    });

    if (!process.env.PROMPT_IO_AUTH_TOKEN) {
      throw new Error('PROMPT_IO_AUTH_TOKEN is not configured');
    }

    const client = new PromptIoClient();
    console.log('Created Prompt.io client');
    
    const lists = await client.getContactLists();
    console.log('Retrieved lists:', lists);

    return Response.json({ lists });
  } catch (error) {
    console.error('Error in contacts API route:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    return Response.json(
      { 
        error: error.message || 'Failed to fetch contact lists',
        details: error.stack
      },
      { status: 500 }
    );
  }
}
