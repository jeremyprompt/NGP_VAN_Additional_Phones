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
      const url = `${this.baseUrl}/people/${vanId}${$expand ? `?$expand=${$expand}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NGP VAN API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error in NGP VAN API call:', error);
      throw error;
    }
  }
}

export default new NgpVanClient(); 