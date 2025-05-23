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
      const response = await fetch(
        `${this.baseUrl}/contact_lists?first=${first}&max=${max}`,
        {
          headers: this.getAuthHeader()
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Filter lists to only include those of type 'NGP_VAN'
      return data.filter(list => list.type === 'NGP_VAN');
    } catch (error) {
      console.error('Error fetching contact lists:', error);
      throw error;
    }
  }
}

export default PromptIoClient; 