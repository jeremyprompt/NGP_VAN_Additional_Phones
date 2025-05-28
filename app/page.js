'use client';

import { useState } from 'react';
import ContactDisplay from '@/components/ContactDisplay';

export default function Home() {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({});
  const [ngpVanDetails, setNgpVanDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      // Fetch customer details for each contact
      for (const contact of contacts) {
        if (contact.customer?.id) {
          console.log('Fetching details for customer:', contact.customer.id);
          try {
            const detailsResponse = await fetch(`/api/customer/${contact.customer.id}`);
            if (!detailsResponse.ok) {
              console.error(`Failed to fetch details for customer ${contact.customer.id}`);
              continue;
            }
            const details = await detailsResponse.json();
            console.log('Received customer details:', details);
            setCustomerDetails(prev => ({
              ...prev,
              [contact.customer.id]: details
            }));
          } catch (error) {
            console.error('Error fetching customer details:', error);
          }
        }
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
      setCustomerDetails(prev => ({
        ...prev,
        [customerId]: details
      }));

      // Fetch NGP VAN details if vanId exists
      if (details.vanId) {
        try {
          const ngpVanResponse = await fetch(`/api/ngpvan/${details.vanId}`);
          if (!ngpVanResponse.ok) {
            console.error(`Failed to fetch NGP VAN details for vanId ${details.vanId}`);
            return;
          }
          const ngpVanData = await ngpVanResponse.json();
          setNgpVanDetails(prev => ({
            ...prev,
            [customerId]: ngpVanData
          }));
        } catch (err) {
          console.error(`Error fetching NGP VAN details for vanId ${details.vanId}:`, err);
        }
      }
    } catch (err) {
      console.error(`Error fetching details for customer ${customerId}:`, err);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">NGP VAN Contact Lists</h1>
        
        <button
          onClick={fetchLists}
          disabled={loading}
          className="mb-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Loading...' : 'Load Contact Lists'}
        </button>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div key={list.id} className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
                <h2 className="text-xl font-semibold mb-2 text-black">{list.name}</h2>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>Type: {list.type}</p>
                  <button
                    onClick={() => fetchContacts(list.id)}
                    disabled={loading}
                    className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
                  >
                    {loading && selectedList === list.id ? 'Loading Contacts...' : 'Display Contacts'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && !error && (
          <p className="text-gray-500">Click the button above to load contact lists</p>
        )}

        {contacts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Contacts in Selected List</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact) => {
                const customerId = contact.customer.id;
                return (
                  <div key={customerId} className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
                    <h3 className="text-lg font-semibold mb-2 text-black">
                      {contact.customer.displayName}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>Created: {new Date(contact.customer.createdDate).toLocaleDateString()}</p>
                      {contact.customer.channels.map((channel, index) => (
                        <p key={index}>Phone: {channel.key}</p>
                      ))}
                      <button
                        onClick={() => fetchContactDetails(customerId)}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Load Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 