'use client';

import React, { useState } from 'react';

const ContactCard = ({ contact }) => {
  const [showAdditionalPhones, setShowAdditionalPhones] = useState(false);

  const formatPhoneNumber = (phone) => {
    const number = phone.phoneNumber;
    return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  };

  const renderPhoneNumbers = () => {
    // First check for NGP VAN phones
    if (contact.phones && contact.phones.length > 0) {
      const firstPhone = contact.phones[0];
      const additionalPhones = contact.phones.slice(1);

      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Primary:</span>
            <span className="font-medium">{formatPhoneNumber(firstPhone)}</span>
            <span className="text-sm text-gray-500">({firstPhone.phoneType})</span>
          </div>

          {additionalPhones.length > 0 && (
            <>
              {showAdditionalPhones ? (
                <div className="space-y-2">
                  {additionalPhones.map((phone, index) => (
                    <div key={phone.phoneId} className="flex items-center space-x-2">
                      <span className="text-gray-600">Additional {index + 1}:</span>
                      <span className="font-medium">{formatPhoneNumber(phone)}</span>
                      <span className="text-sm text-gray-500">({phone.phoneType})</span>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowAdditionalPhones(false)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Show Less
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdditionalPhones(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Show {additionalPhones.length} More Phone Number{additionalPhones.length !== 1 ? 's' : ''}
                </button>
              )}
            </>
          )}
        </div>
      );
    }

    // Fallback to Prompt.io channels if no NGP VAN phones
    if (contact.customer?.channels && contact.customer.channels.length > 0) {
      return (
        <div className="space-y-2">
          {contact.customer.channels.map((channel, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-gray-600">Phone {index + 1}:</span>
              <span className="font-medium">{channel.key}</span>
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-gray-500">No phone numbers available</p>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="text-xl font-semibold mb-4">
        {contact.customer?.displayName || `${contact.firstName} ${contact.lastName}`}
      </h3>
      {renderPhoneNumbers()}
    </div>
  );
};

const ContactDisplay = ({ contacts }) => {
  if (!contacts) return null;

  const contactsArray = Array.isArray(contacts) ? contacts : [contacts];

  return (
    <div className="space-y-4">
      {contactsArray.map((contact, index) => (
        <ContactCard key={contact.customer?.id || contact.vanId || index} contact={contact} />
      ))}
    </div>
  );
};

export default ContactDisplay; 