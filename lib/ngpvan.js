class NgpVanClient {
  constructor() {
    this.baseUrl = 'https://api.ngpvan.com/v4';
    this.username = 'fsokhansanj';
    this.password = '7b1688f4-0754-bd00-b9d6-855bcdb27e37|0';
  }

  auth(username, password) {
    this.username = username;
    this.password = password;
    return this;
  }

  getAuthHeader() {
    const authString = `${this.username}:${this.password}`;
    const base64Auth = Buffer.from(authString).toString('base64');
    return {
      'Authorization': `Basic ${base64Auth}`,
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
        stack: error.stack
      });
      throw error;
    }
  }
}

const ngpvan = new NgpVanClient();
ngpvan.auth('fsokhansanj', '7b1688f4-0754-bd00-b9d6-855bcdb27e37|0');

export default ngpvan; 