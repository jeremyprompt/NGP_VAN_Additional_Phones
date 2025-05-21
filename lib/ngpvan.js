class NgpVanClient {
  constructor() {
    this.baseUrl = 'https://api.securevan.com/v4';
    this.username = process.env.NGP_VAN_USERNAME || '';
    this.password = process.env.NGP_VAN_PASSWORD || '';
  }

  getAuthHeader() {
    if (!this.username || !this.password) {
      throw new Error('NGP VAN credentials are not configured');
    }
    // Create Basic auth token by encoding username:password in base64
    const authString = `${this.username}:${this.password}`;
    const base64Auth = Buffer.from(authString).toString('base64');
    return `Basic ${base64Auth}`;
  }

  async getPeople(params) {
    const authHeader = this.getAuthHeader();
    console.log('Auth header:', authHeader);

    console.log('Making NGP VAN API request with params:', {
      ...params,
      baseUrl: this.baseUrl,
      hasAuth: !!authHeader
    });

    const queryParams = new URLSearchParams({
      firstName: params.firstName,
      lastName: params.lastName,
      ...(params.$expand && { $expand: params.$expand }),
    });

    const url = `${this.baseUrl}/people?${queryParams}`;
    console.log('Request URL:', url);

    try {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      };
      console.log('Request options:', JSON.stringify(requestOptions, null, 2));

      const response = await fetch(url, requestOptions);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('NGP VAN API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`Failed to parse response: ${parseError.message}`);
      }

      return data;
    } catch (error) {
      console.error('NGP VAN API Request Error:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}

export const ngpvan = new NgpVanClient(); 