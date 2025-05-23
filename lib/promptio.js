class PromptIoClient {
  constructor() {
    this.baseUrl = 'https://jeremy.prompt.io/rest/1.0';
    this.authToken = process.env.PROMPT_IO_AUTH_TOKEN;
  }

  getAuthHeader() {
    return {
      'orgAuthToken': this.authToken,
      'accept': '*/*'
    };
  }

  async getContactLists(first = 0, max = 200) {
    try {
      console.log('Making request to Prompt.io API...');
      console.log('URL:', `${this.baseUrl}/contact_lists?first=${first}&max=${max}`);
      console.log('Headers:', this.getAuthHeader());

      const response = await fetch(
        `${this.baseUrl}/contact_lists?first=${first}&max=${max}`,
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
      console.log('Response data:', data);
      
      // Filter lists to only include those of type 'NGP_VAN'
      const filteredLists = data.filter(list => list.type === 'NGP_VAN');
      console.log('Filtered NGP VAN lists:', filteredLists);
      
      return filteredLists;
    } catch (error) {
      console.error('Error in getContactLists:', {
        message: error.message,
        stack: error.stack,
        authTokenPresent: !!this.authToken
      });
      throw error;
    }
  }
}

export default PromptIoClient; 