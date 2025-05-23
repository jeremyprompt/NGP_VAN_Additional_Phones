import ngpvan from '@api/ngpvan';

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    console.log('Environment check:', {
      hasAuthToken: !!process.env.NGP_VAN_AUTH_TOKEN,
      nodeEnv: process.env.NODE_ENV
    });

    if (!process.env.NGP_VAN_AUTH_TOKEN) {
      throw new Error('NGP_VAN_AUTH_TOKEN is not configured');
    }

    const vanId = params.vanId;
    console.log('Fetching NGP VAN details for ID:', vanId);

    // Auth is handled by environment variables
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