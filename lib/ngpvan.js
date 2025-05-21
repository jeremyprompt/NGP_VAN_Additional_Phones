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
    console.log('Making NGP VAN API request with params:', {
      ...params,
      baseUrl: this.baseUrl,
      hasAuth: !!this.getAuthHeader()
    });

    const queryParams = new URLSearchParams({
      firstName: params.firstName,
      lastName: params.lastName,
      ...(params.$expand && { $expand: params.$expand }),
    });

    const url = `${this.baseUrl}/people?${queryParams}`;
    console.log('Request URL:', url);

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

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

      const data = await response.json();
      console.log('NGP VAN API Response:', JSON.stringify(data, null, 2));
      return data; // Return the full response
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