import ngpvan from '@/lib/ngpvan';

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { vanId } = params;
    
    // Authenticate with NGP VAN
    ngpvan.auth(process.env.NGP_VAN_USERNAME, process.env.NGP_VAN_PASSWORD);
    
    // Make the API call
    const response = await ngpvan.peoplevanid1({
      $expand: 'phones%2Cemails',
      vanId: vanId
    });

    return Response.json(response.data);
  } catch (error) {
    console.error('Error in NGP VAN API route:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 