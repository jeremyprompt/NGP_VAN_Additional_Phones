class NgpVanClient {
  constructor() {
    this.baseUrl = 'https://api.securevan.com/v4';
    this.authToken = process.env.NGP_VAN_AUTH_TOKEN || '';
  }

  getAuthHeader() {
    if (!this.authToken) {
      throw new Error('NGP VAN credentials are not configured');
    }
    return `Basic ${this.authToken}`;
  }

  async getPeople(params) {
    const queryParams = new URLSearchParams({
      firstName: params.firstName,
      lastName: params.lastName,
      ...(params.$expand && { $expand: params.$expand }),
    });

    const response = await fetch(`${this.baseUrl}/people?${queryParams}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.statusText}. Details: ${errorText}`);
    }

    return response.json();
  }
}

export const ngpvan = new NgpVanClient(); 