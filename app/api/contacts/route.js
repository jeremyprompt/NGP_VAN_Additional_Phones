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

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');

    const client = new PromptIoClient();
    console.log('Created Prompt.io client');
    
    if (listId) {
      console.log(`Fetching contacts for list ${listId}`);
      const contacts = await client.getAllContactsFromList(listId);
      return Response.json({ contacts });
    } else {
      console.log('Fetching contact lists');
      const lists = await client.getContactLists();
      return Response.json({ lists });
    }
  } catch (error) {
    console.error('Error in contacts API route:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    return Response.json(
      { 
        error: error.message || 'Failed to fetch data',
        details: error.stack
      },
      { status: 500 }
    );
  }
}
