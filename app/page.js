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
  const [isDomainLocked, setIsDomainLocked] = useState(false);

  const handleDomainSubmit = (e) => {
    e.preventDefault();
    if (domain.trim()) {
      setIsDomainLocked(true);
    }
  };

  const resetDomain = () => {
    setDomain('');
    setIsDomainLocked(false);
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
      setLists(data.lists?.contactLists || []);
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
      const url = `/api/contacts${listId ? `?listId=${listId}` : ''}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch contacts');
      }
      
      const data = await response.json();
      console.log('Received contacts data:', data);
      
      // Extract the contacts array from the response
      const contacts = data.contacts || [];
      setContacts(contacts);
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
      const response = await fetch(`/api/contacts${listId ? `?listId=${listId}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      const customerIds = data.contacts.map(contact => contact.customer.id);
      console.log('Customer IDs:', customerIds);

      // Fetch contact details for each customer ID
      for (const customerId of customerIds) {
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
          {!isDomainLocked ? (
            <form onSubmit={handleDomainSubmit} className="space-y-4">
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
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Set Domain
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm text-gray-500">Current domain:</span>
                <span className="ml-2 font-medium">{domain}.prompt.io</span>
              </div>
              <button
                onClick={resetDomain}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Change Domain
              </button>
            </div>
          )}

          {isDomainLocked && (
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