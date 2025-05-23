'use client';

import { useState } from 'react';
import ContactDisplay from '@/components/ContactDisplay';

export default function Home() {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerIds, setCustomerIds] = useState([]);

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
    console.log('Fetching contacts for listId:', listId);
    setLoading(true);
    setError(null);
    setContacts([]);
    setCustomerIds([]);
    try {
      const url = `/api/contacts?listId=${listId}`;
      console.log('Making request to:', url);
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch contacts');
      }
      const data = await response.json();
      console.log('Received contacts data:', data);
      
      const contactsData = data.contacts || [];
      const ids = contactsData.map(contact => contact.customer.id);
      
      setContacts(contactsData);
      setCustomerIds(ids);
      setSelectedList(listId);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">NGP VAN Contact Lists</h1>
        
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
                  <p>Created: {new Date(list.createdAt).toLocaleDateString()}</p>
                  <p>Contacts: {list.contactCount || 0}</p>
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
              {contacts.map((contact) => (
                <div key={contact.customer.id} className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
                  <h3 className="text-lg font-semibold mb-2 text-black">
                    {contact.customer.displayName}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    {contact.customer.channels.map((channel, index) => (
                      <p key={index}>Phone: {channel.key}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 