export default function ContactDisplay({ contact }) {
  if (!contact) {
    return <div>No contact information available</div>;
  }

  // Handle the case where contact is an array of items
  const contacts = contact.items || [contact];

  return (
    <div className="space-y-6">
      {contacts.map((contact) => (
        <div key={contact.vanId} className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">
            {contact.firstName} {contact.middleName ? `${contact.middleName} ` : ''}{contact.lastName}
            {contact.suffix && ` ${contact.suffix}`}
          </h2>
          
          <div className="text-sm text-gray-600 mb-4">
            <p>Party: {contact.party || 'Unknown'}</p>
            {contact.dateOfBirth && (
              <p>Date of Birth: {new Date(contact.dateOfBirth).toLocaleDateString()}</p>
            )}
          </div>

          {contact.phones && contact.phones.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Phone Numbers:</h3>
              {contact.phones.map((phone) => (
                <div key={phone.phoneId} className="flex items-center space-x-2">
                  <span className="text-gray-600">{phone.phoneType}:</span>
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
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No phone numbers available</p>
          )}
        </div>
      ))}
    </div>
  );
} 