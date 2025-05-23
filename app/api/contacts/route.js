import PromptIoClient from '@/lib/promptio';

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    if (!process.env.PROMPT_IO_AUTH_TOKEN) {
      throw new Error('PROMPT_IO_AUTH_TOKEN is not configured');
    }

    const client = new PromptIoClient();
    const lists = await client.getContactLists();

    return Response.json({ lists });
  } catch (error) {
    console.error('Error in contacts API route:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch contact lists' },
      { status: 500 }
    );
  }
}
