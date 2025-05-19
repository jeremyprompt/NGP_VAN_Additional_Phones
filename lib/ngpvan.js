class NgpVanClient {
  constructor() {
    this.baseUrl = 'https://api.myngp.com/v4';
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