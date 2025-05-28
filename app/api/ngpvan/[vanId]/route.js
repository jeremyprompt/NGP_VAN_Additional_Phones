import ngpvan from '@/lib/ngpvan';

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { vanId } = params;
    console.log('Fetching NGP VAN details for vanId:', vanId);

    if (!process.env.NGP_VAN_USERNAME || !process.env.NGP_VAN_PASSWORD) {
      console.error('Missing NGP VAN credentials:', {
        username: process.env.NGP_VAN_USERNAME ? 'Set' : 'Not set',
        password: process.env.NGP_VAN_PASSWORD ? 'Set' : 'Not set'
      });
      throw new Error('NGP VAN credentials not configured');
    }

    // Initialize with environment variables
    ngpvan.auth(process.env.NGP_VAN_USERNAME, process.env.NGP_VAN_PASSWORD);

    console.log('Making NGP VAN API call...', {
      vanId,
      expand: 'phones',
      baseUrl: 'https://api.securevan.com/v4'
    });

    const { data } = await ngpvan.peoplevanid1({
      $expand: 'phones',
      vanId
    });

    if (!data) {
      throw new Error('No data received from NGP VAN API');
    }

    console.log('Retrieved NGP VAN data:', {
      hasData: !!data,
      hasPhones: !!data.phones,
      phoneCount: data.phones?.length
    });

    return Response.json(data);
  } catch (error) {
    console.error('Error in NGP VAN API route:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      vanId: params.vanId,
      env: {
        hasUsername: !!process.env.NGP_VAN_USERNAME,
        hasPassword: !!process.env.NGP_VAN_PASSWORD
      }
    });
    
    return Response.json(
      { 
        error: error.message || 'Failed to fetch NGP VAN data',
        details: error.stack,
        vanId: params.vanId
      },
      { status: 500 }
    );
  }
} 