'use client';

import { useState } from 'react';
import ngpvan from '@/lib/ngpvan';

// Add NGP VAN credentials
const NGP_VAN_USERNAME = process.env.NGP_VAN_USERNAME;
const NGP_VAN_PASSWORD = process.env.NGP_VAN_PASSWORD;

export default function Home() {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedListName, setSelectedListName] = useState('');
  const [contacts, setContacts] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({});
  const [ngpVanDetails, setNgpVanDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [domain, setDomain] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [domainSaved, setDomainSaved] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!domain.trim() || !apiKey.trim()) {
      setError('Please enter both domain and API key');
      return;
    }

    try {
      // Clear old cookies
      await fetch('/api/domain', { method: 'DELETE' });
      await fetch('/api/config', { method: 'DELETE' });
      
      // Store domain
      const domainResponse = await fetch('/api/domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domain: domain.trim() })
      });

      if (!domainResponse.ok) {
        throw new Error('Failed to set domain');
      }

      // Store API key
      const apiKeyResponse = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });

      if (!apiKeyResponse.ok) {
        throw new Error('Failed to set API key');
      }

      // Clear any existing lists when configuration changes
      setLists([]);
      setSelectedList(null);
      setIsConfigured(true);
    } catch (error) {
      console.error('Error setting configuration:', error);
      setError('Failed to set configuration. Please try again.');
    }
  };

  const resetConfig = () => {
    setDomain('');
    setApiKey('');
    setIsConfigured(false);
    setLists([]);
    setSelectedList(null);
    setSelectedListName('');
    setContacts([]);
  };

  const fetchLists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contact lists');
      }
      const data = await response.json();
      console.log('Received lists data:', data);
      
      // Filter for NGP_VAN lists
      const ngpVanLists = (data.lists?.contactLists || []).filter(list => list.type === 'NGP_VAN');
      console.log('Filtered NGP_VAN lists:', ngpVanLists);
      setLists(ngpVanLists);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async (listId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching contacts for listId:', listId);
      const url = `/api/contacts?listId=${listId}&first=0&max=200`;
      console.log('Initial request URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch contacts');
      }
      
      const data = await response.json();
      console.log('Initial contacts response:', data);
      
      // Extract the contacts array from the response
      const contacts = data.contacts?.customerContacts || [];
      const totalCount = data.contacts?.count || 0;
      
      console.log('Processed initial response:', {
        totalCount,
        initialContacts: contacts.length,
        hasContacts: contacts.length > 0
      });
      
      // If there are more contacts to fetch, fetch them all
      if (totalCount > contacts.length) {
        console.log(`Fetching all contacts (${totalCount} total, already have ${contacts.length})`);
        const allContacts = [...contacts];
        let first = contacts.length;
        let emptyResponses = 0;
        const MAX_EMPTY_RESPONSES = 3;
        
        while (first < totalCount && emptyResponses < MAX_EMPTY_RESPONSES) {
          const nextUrl = `/api/contacts?listId=${listId}&first=${first}&max=200`;
          console.log('Fetching next page:', nextUrl);
          
          const nextResponse = await fetch(nextUrl);
          if (!nextResponse.ok) {
            const errorData = await nextResponse.json();
            console.error('Error fetching next page:', errorData);
            throw new Error('Failed to fetch next page of contacts');
          }
          
          const nextData = await nextResponse.json();
          const nextContacts = nextData.contacts?.customerContacts || [];
          console.log('Received next page:', {
            requested: first,
            received: nextContacts.length,
            total: allContacts.length + nextContacts.length,
            response: nextData
          });
          
          if (nextContacts.length === 0) {
            emptyResponses++;
            console.log(`Received empty response (${emptyResponses}/${MAX_EMPTY_RESPONSES})`);
            // Still increment first to try the next page
            first += 200;
          } else {
            emptyResponses = 0; // Reset counter on successful response
            allContacts.push(...nextContacts);
            first += nextContacts.length;
          }
          
          console.log(`Fetched ${allContacts.length} of ${totalCount} contacts`);
        }
        
        if (emptyResponses >= MAX_EMPTY_RESPONSES) {
          console.warn('Stopping pagination due to multiple empty responses');
        }
        
        console.log('All contacts fetched:', {
          total: allContacts.length,
          expected: totalCount
        });
        setContacts(allContacts);
      } else {
        console.log('No additional contacts to fetch:', {
          total: contacts.length,
          expected: totalCount
        });
        setContacts(contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactDetails = async (customerId) => {
    try {
      console.log('Fetching details for customer:', customerId);
      const response = await fetch(`/api/customer/${customerId}`);
      
      if (!response.ok) {
        console.error(`Failed to fetch details for customer ${customerId}`);
        return;
      }
      
      const details = await response.json();
      console.log('Received customer details:', details);

      // Extract vanId from the response
      const vanId = details.vanId;
      console.log('Extracted vanId:', vanId);

      // Store both the full details and the vanId
      setCustomerDetails(prev => ({
        ...prev,
        [customerId]: {
          ...details,
          vanId // Store vanId at the top level for easy access
        }
      }));

      // If we have a vanId, fetch NGP VAN data
      if (vanId) {
        try {
          console.log('Fetching NGP VAN data for vanId:', vanId);
          const ngpVanResponse = await fetch(`/api/ngpvan/${vanId}`);
          
          if (!ngpVanResponse.ok) {
            console.error(`Failed to fetch NGP VAN data for vanId ${vanId}`);
            return;
          }
          
          const ngpVanData = await ngpVanResponse.json();
          console.log('Received NGP VAN data:', ngpVanData);
          
          // Store the NGP VAN data
          setNgpVanDetails(prev => ({
            ...prev,
            [customerId]: ngpVanData
          }));
        } catch (error) {
          console.error('Error fetching NGP VAN data:', error);
        }
      }
    } catch (err) {
      console.error(`Error fetching details for customer ${customerId}:`, err);
    }
  };

  const generateSecondaryPhonesList = async (listId) => {
    try {
      if (!selectedListName) {
        throw new Error('No list name selected');
      }

      const extrasListName = `${selectedListName}_EXTRAS`;
      console.log('Looking for or creating list:', extrasListName);

      // First, check if the contact list exists
      const checkResponse = await fetch('/api/contact-lists/check');
      if (!checkResponse.ok) {
        throw new Error('Failed to check existing contact lists');
      }
      
      const existingLists = await checkResponse.json();
      console.log('Existing lists response:', JSON.stringify(existingLists, null, 2));
      
      // Check if the response is an array
      if (!Array.isArray(existingLists)) {
        console.error('Unexpected response format:', existingLists);
        throw new Error('Invalid response format from contact lists check');
      }
      
      // Log all list names for debugging
      console.log('All list names:', existingLists.map(list => list.name));
      
      let targetList = null;
      const targetListIndex = existingLists.findIndex(list => {
        console.log('Checking list:', {
          name: list.name,
          matches: list.name === extrasListName
        });
        return list.name === extrasListName;
      });
      
      if (targetListIndex !== -1) {
        console.log('List already exists:', existingLists[targetListIndex]);
        targetList = existingLists[targetListIndex];
      } else {
        // Create the list if it doesn't exist
        const contactListResponse = await fetch('/api/contact-lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: extrasListName
          })
        });
        
        if (!contactListResponse.ok) {
          throw new Error('Failed to create contact list');
        }
        
        const contactListData = await contactListResponse.json();
        console.log('Created new contact list:', contactListData);
        targetList = contactListData; // Store the newly created list
      }

      // Now fetch and process contacts
      const response = await fetch(`/api/contacts?listId=${listId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      console.log('Received contacts data:', data);
      
      // Get total count and initial contacts
      const totalCount = data.contacts?.count || 0;
      let allCustomerIds = [];
      let first = 0;
      
      // Fetch all contacts in batches
      while (first < totalCount) {
        const batchUrl = `/api/contacts?listId=${listId}&first=${first}&max=200`;
        console.log('Fetching contacts batch:', batchUrl);
        
        const batchResponse = await fetch(batchUrl);
        if (!batchResponse.ok) {
          throw new Error('Failed to fetch contacts batch');
        }
        
        const batchData = await batchResponse.json();
        const batchCustomerIds = batchData.contacts?.customerContacts?.map(contact => contact.customer.id) || [];
        allCustomerIds.push(...batchCustomerIds);
        
        first += batchCustomerIds.length;
        console.log(`Fetched ${allCustomerIds.length} of ${totalCount} customer IDs`);
      }
      
      console.log('Total customer IDs to process:', allCustomerIds.length);

      let addedContactsCount = 0;

      // Fetch contact details for each customer ID
      for (const customerId of allCustomerIds) {
        const detailsResponse = await fetch(`/api/customer/${customerId}`);
        if (!detailsResponse.ok) {
          console.error(`Failed to fetch details for customer ${customerId}`);
          continue;
        }
        const details = await detailsResponse.json();
        console.log(`Customer ID ${customerId} - vanId:`, details.vanId);

        // Make NGP VAN API call through our server-side route
        try {
          const ngpVanResponse = await fetch(`/api/ngpvan/${details.vanId}`);
          if (!ngpVanResponse.ok) {
            throw new Error(`Failed to fetch NGP VAN data for vanId ${details.vanId}`);
          }
          const ngpVanData = await ngpVanResponse.json();
          
          if (ngpVanData.phones && ngpVanData.phones.length > 0) {
            console.log(`First phone number for vanId ${details.vanId}:`, ngpVanData.phones[0].phoneNumber);
            
            // If there are multiple phones, add additional ones to the list
            if (ngpVanData.phones.length > 1) {
              console.log(`Found ${ngpVanData.phones.length} phones for vanId ${details.vanId}`);
              
              // Get the display name
              const displayName = `${ngpVanData.firstName} ${ngpVanData.lastName}`.trim();
              
              // Validate display name
              if (!displayName || displayName === ' ') {
                console.error('Invalid display name:', {
                  firstName: ngpVanData.firstName,
                  lastName: ngpVanData.lastName,
                  vanId: details.vanId
                });
                continue; // Skip this contact if no valid name
              }
              
              console.log('Creating display name:', {
                firstName: ngpVanData.firstName,
                lastName: ngpVanData.lastName,
                displayName: displayName,
                vanId: details.vanId
              });
              
              // Add each additional phone number to the list
              for (let i = 1; i < ngpVanData.phones.length; i++) {
                const phone = ngpVanData.phones[i];
                try {
                  console.log('Adding contact to list:', {
                    phoneNumber: phone.phoneNumber,
                    displayName: displayName,
                    listId: targetList.id
                  });
                  
                  // Add a small delay between operations
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  const addContactResponse = await fetch(`/api/contact-lists/${targetList.id}/contacts`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      identityType: 'SMS',
                      contacts: [{
                        identityKey: phone.phoneNumber,
                        displayName: displayName
                      }]
                    })
                  });

                  if (!addContactResponse.ok) {
                    const errorData = await addContactResponse.json();
                    console.error('Error adding contact:', errorData);
                    throw new Error(`Failed to add contact: ${errorData.error || 'Unknown error'}`);
                  }

                  addedContactsCount++;
                  console.log('Successfully added contact to list');
                } catch (error) {
                  console.error('Error adding contact to list:', error);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing NGP VAN data:', error);
        }
      }

      console.log(`Added ${addedContactsCount} contacts to the list`);
      if (addedContactsCount === 0) {
        setError('No additional phone numbers were found to add to the list');
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Error in generateSecondaryPhonesList:', error);
      setError(error.message);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">NGP VAN Additional Phones</h1>
        
        <div className="space-y-6">
          {!isConfigured ? (
            <form onSubmit={handleConfigSubmit} className="space-y-4">
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your Prompt.io domain
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="your-domain"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your Prompt.io API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="your-api-key"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <div>
                  <span className="text-sm text-gray-500">Current domain:</span>
                  <span className="ml-2 font-medium">{domain}.prompt.io</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">API Key:</span>
                  <span className="ml-2 font-medium">••••••••{apiKey.slice(-4)}</span>
                </div>
              </div>
              <button
                onClick={resetConfig}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Change Configuration
              </button>
            </div>
          )}

          {isConfigured && (
            <>
              <div>
                <button
                  onClick={fetchLists}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Fetch Lists'}
                </button>
              </div>

              {lists.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Select a List</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lists.map((list) => (
                      <button
                        key={list.id}
                        onClick={() => {
                          setSelectedList(list);
                          setSelectedListName(list.name);
                          fetchContacts(list.id);
                        }}
                        className={`p-4 border rounded-lg ${
                          selectedList?.id === list.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <h3 className="font-medium">{list.name}</h3>
                        <p className="text-sm text-gray-500">{list.type}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedList && (
                <div>
                  <button
                    onClick={() => generateSecondaryPhonesList(selectedList.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Generate Secondary Phones List'}
                  </button>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 