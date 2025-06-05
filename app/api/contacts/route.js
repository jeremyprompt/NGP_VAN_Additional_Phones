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
    console.log('Request URL:', request.url);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    console.log('ListId from params:', listId);

    const client = PromptIoClient.getInstance();
    console.log('Retrieved Prompt.io client instance');
    
    if (listId) {
      console.log(`Fetching contacts for list ${listId}`);
      const contacts = await client.getAllContactsFromList(listId);
      console.log(`Retrieved ${contacts.length} contacts for list ${listId}`);
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
