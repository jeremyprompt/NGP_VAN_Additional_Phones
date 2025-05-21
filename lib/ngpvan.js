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
    return `ApiUser ${this.username}:${this.password}`;
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
      return { data };
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