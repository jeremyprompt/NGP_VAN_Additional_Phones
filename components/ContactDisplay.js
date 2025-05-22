'use client';

import { useState } from 'react';

function ContactCard({ contact }) {
  const [showAdditionalPhones, setShowAdditionalPhones] = useState(false);
  const hasAdditionalPhones = contact.phones && contact.phones.length > 1;

  return (
    <div className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column - Basic Info */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
            {contact.firstName} {contact.middleName ? `${contact.middleName} ` : ''}{contact.lastName}
            {contact.suffix && ` ${contact.suffix}`}
          </h2>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p className="flex items-center">
              <span className="font-medium w-24">Party:</span>
              <span className="px-2 py-1 bg-gray-100 rounded">{contact.party || 'Unknown'}</span>
            </p>
            {contact.dateOfBirth && (
              <p className="flex items-center">
                <span className="font-medium w-24">DOB:</span>
                <span className="px-2 py-1 bg-gray-100 rounded">
                  {new Date(contact.dateOfBirth).toLocaleDateString()}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Right column - Phone Numbers */}
        <div className="space-y-3">
          {contact.phones && contact.phones.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-medium text-gray-700">Phone Numbers</h3>
                {hasAdditionalPhones && (
                  <button
                    onClick={() => setShowAdditionalPhones(!showAdditionalPhones)}
                    className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors duration-200"
                  >
                    {showAdditionalPhones ? 'Hide Additional' : 'Show Additional'}
                  </button>
                )}
              </div>
              
              {/* First phone number */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium">{contact.phones[0].phoneType}:</span>
                  <span className="font-medium">
                    {contact.phones[0].dialingPrefix ? `+${contact.phones[0].dialingPrefix} ` : ''}
                    {contact.phones[0].phoneNumber}
                  </span>
                  {contact.phones[0].isPreferred && (
                    <span className="text-sm text-blue-600">(Preferred)</span>
                  )}
                  {contact.phones[0].isCellStatus && (
                    <span className="text-sm text-gray-500">
                      ({contact.phones[0].isCellStatus.statusName})
                    </span>
                  )}
                </div>
              </div>

              {/* Additional phone numbers */}
              {showAdditionalPhones && contact.phones.slice(1).map((phone) => (
                <div key={phone.phoneId} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-medium">{phone.phoneType}:</span>
                    <span className="font-medium">
                      {phone.dialingPrefix ? `+${phone.dialingPrefix} ` : ''}
                      {phone.phoneNumber}
                    </span>
                    {phone.isPreferred && (
                      <span className="text-sm text-blue-600">(Preferred)</span>
                    )}
                    {phone.isCellStatus && (
                      <span className="text-sm text-gray-500">
                        ({phone.isCellStatus.statusName})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No phone numbers available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContactDisplay({ contact }) {
  if (!contact) {
    return <div className="text-gray-500 italic">No contact information available</div>;
  }

  // Handle the case where contact is an array of items
  const contacts = contact.items || [contact];

  return (
    <div className="grid grid-cols-1 gap-6 max-w-6xl mx-auto">
      {contacts.map((contact) => (
        <ContactCard key={contact.vanId} contact={contact} />
      ))}
    </div>
  );
} 