import fetch from 'node-fetch';

class NgpVanClient {
  constructor() {
    this.baseUrl = 'https://api.securevan.com/v4';
    this.username = process.env.NGP_VAN_USERNAME;
    this.password = process.env.NGP_VAN_PASSWORD;
  }

  auth(username, password) {
    this.username = username;
    this.password = password;
  }

  getAuthHeader() {
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    };
  }

  async peoplevanid1({ $expand, vanId }) {
    try {
      console.log('Making NGP VAN API call for vanId:', vanId);
      const url = `${this.baseUrl}/people/${vanId}${$expand ? `?$expand=${$expand}` : ''}`;
      console.log('NGP VAN Request URL:', url);
      console.log('Using credentials:', {
        username: this.username ? 'Set' : 'Not set',
        password: this.password ? 'Set' : 'Not set'
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('NGP VAN Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`NGP VAN API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('NGP VAN API response:', data);
      return { data };
    } catch (error) {
      console.error('Error in NGP VAN API call:', {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      });
      throw error;
    }
  }
}

const ngpvan = new NgpVanClient();
export default ngpvan; 