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
      console.log('Raw response data:', data);
      
      if (!data.contactLists || !Array.isArray(data.contactLists)) {
        throw new Error('Response does not contain contactLists array');
      }

      // Filter lists to only include those of type 'NGP_VAN'
      const filteredLists = data.contactLists.filter(list => list.type === 'NGP_VAN');
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

  async getContactsFromList(listId, first = 0, max = 200) {
    try {
      console.log(`Fetching contacts for list ${listId}, offset: ${first}, limit: ${max}`);
      
      const response = await fetch(
        `${this.baseUrl}/contact_lists/${listId}/contacts?first=${first}&max=${max}`,
        {
          headers: this.getAuthHeader()
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log(`Received ${data.contacts?.length || 0} contacts for list ${listId}`);
      
      return data;
    } catch (error) {
      console.error('Error in getContactsFromList:', {
        message: error.message,
        stack: error.stack,
        listId
      });
      throw error;
    }
  }

  async getAllContactsFromList(listId) {
    let allContacts = [];
    let first = 0;
    const max = 200;
    let hasMore = true;

    while (hasMore) {
      const data = await this.getContactsFromList(listId, first, max);
      
      if (!data.contacts || !Array.isArray(data.contacts)) {
        throw new Error('Response does not contain contacts array');
      }

      allContacts = [...allContacts, ...data.contacts];
      
      // Check if we've received all contacts
      if (data.contacts.length < max) {
        hasMore = false;
      } else {
        first += max;
      }
    }

    console.log(`Retrieved total of ${allContacts.length} contacts for list ${listId}`);
    return allContacts;
  }
}

export default PromptIoClient; 