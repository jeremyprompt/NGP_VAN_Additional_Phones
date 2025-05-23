class NgpVanClient {
  constructor() {
    this.baseUrl = 'https://api.ngpvan.com/v4';
    this.authToken = process.env.NGP_VAN_AUTH_TOKEN;
  }

  getAuthHeader() {
    return {
      'Authorization': `Basic ${this.authToken}`,
      'Accept': 'application/json'
    };
  }

  async peoplevanid1({ $expand, vanId }) {
    try {
      console.log('Making request to NGP VAN API...');
      console.log('URL:', `${this.baseUrl}/people/${vanId}?$expand=${$expand}`);
      console.log('Headers:', this.getAuthHeader());

      const response = await fetch(
        `${this.baseUrl}/people/${vanId}?$expand=${$expand}`,
        {
          headers: this.getAuthHeader()
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Raw response data:', data);
      
      return { data };
    } catch (error) {
      console.error('Error in peoplevanid1:', {
        message: error.message,
        stack: error.stack,
        authTokenPresent: !!this.authToken
      });
      throw error;
    }
  }
}

export default new NgpVanClient(); 