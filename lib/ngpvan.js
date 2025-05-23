import fetch from 'node-fetch';

const ngpvan = {
  username: process.env.NGP_VAN_USERNAME,
  password: process.env.NGP_VAN_PASSWORD,

  auth(username, password) {
    this.username = username;
    this.password = password;
    return this;
  },

  async peoplevanid1({ $expand, vanId }) {
    try {
      if (!this.username || !this.password) {
        throw new Error('NGP VAN credentials not configured');
      }

      console.log('Making request to NGP VAN API...');
      const authString = `${this.username}:${this.password}`;
      const base64Auth = Buffer.from(authString).toString('base64');
      
      const response = await fetch(
        `https://api.ngpvan.com/v4/people/${vanId}?$expand=${$expand}`,
        {
          headers: {
            'Authorization': `Basic ${base64Auth}`,
            'Accept': 'application/json'
          }
        }
      );

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
};

// Initialize with environment variables
ngpvan.auth(process.env.NGP_VAN_USERNAME, process.env.NGP_VAN_PASSWORD);

export default ngpvan; 