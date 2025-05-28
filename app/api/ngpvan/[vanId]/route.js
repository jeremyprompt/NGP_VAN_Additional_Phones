import ngpvan from '@/lib/ngpvan';

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { vanId } = params;
    console.log('Fetching NGP VAN details for vanId:', vanId);

    if (!process.env.NGP_VAN_USERNAME || !process.env.NGP_VAN_PASSWORD) {
      throw new Error('NGP VAN credentials not configured');
    }

    // Initialize with environment variables
    ngpvan.auth(process.env.NGP_VAN_USERNAME, process.env.NGP_VAN_PASSWORD);

    const { data } = await ngpvan.peoplevanid1({
      $expand: 'phones',
      vanId
    });

    console.log('Retrieved NGP VAN data:', data);
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