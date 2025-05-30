import PromptIoClient from '@/lib/promptio';

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const response = await fetch(`https://jeremy.prompt.io/rest/1.0/data/customer/${id}`, {
      headers: {
        'accept': '*/*',
        'orgAuthToken': process.env.PROMPT_IO_AUTH_TOKEN
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customer details: ${response.statusText}`);
    }

    const details = await response.json();
    return Response.json(details);
  } catch (error) {
    console.error('Error in customer details API route:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to fetch customer details'
      },
      { status: 500 }
    );
  }
} 