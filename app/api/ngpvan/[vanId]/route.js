import ngpvan from '@/lib/ngpvan';

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const vanId = params.vanId;
    console.log('Fetching NGP VAN details for ID:', vanId);

    const { data } = await ngpvan.peoplevanid1({
      $expand: 'phones',
      vanId: vanId
    });
    
    console.log('Received NGP VAN data:', data);
    return Response.json(data);
  } catch (error) {
    console.error('Error in NGP VAN API route:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    return Response.json(
      { 
        error: error.message || 'Failed to fetch NGP VAN data',
        details: error.stack
      },
      { status: 500 }
    );
  }
} 