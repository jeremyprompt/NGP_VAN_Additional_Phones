class PromptIoClient {
  constructor() {
    this.baseUrl = 'https://jeremy.prompt.io/rest/1.0';
    this.authToken = process.env.PROMPT_IO_AUTH_TOKEN;
  }

  getAuthHeader() {
    return {
      'accept': '*/*',
      'orgAuthToken': this.authToken
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
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.contactLists || !Array.isArray(data.contactLists)) {
        throw new Error('Response does not contain contactLists array');
      }

      const filteredLists = data.contactLists.filter(list => list.type === 'NGP_VAN');
      
      return {
        contactLists: filteredLists,
        count: filteredLists.length
      };
    } catch (error) {
      console.error('Error in getContactLists:', error);
      throw error;
    }
  }

  async getContactsFromList(listId, first = 0, max = 200) {
    try {
      const response = await fetch(
        `${this.baseUrl}/contact_lists/${listId}/contacts?first=${first}&max=${max}`,
        {
          headers: this.getAuthHeader()
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getContactsFromList:', error);
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
      
      if (data.contacts.length < max) {
        hasMore = false;
      } else {
        first += max;
      }
    }

    return allContacts;
  }

  async getCustomerDetails(customerId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/data/customer/${customerId}`,
        {
          headers: this.getAuthHeader()
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getCustomerDetails:', error);
      throw error;
    }
  }
}

export default new PromptIoClient(); 