export default function ContactDisplay({ contact }) {
  if (!contact) {
    return <div>No contact information available</div>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-2">
        {contact.firstName} {contact.lastName}
      </h2>
      {contact.phones && contact.phones.length > 0 ? (
        <div className="space-y-2">
          {contact.phones.map((phone) => (
            <div key={phone.phoneId} className="flex items-center space-x-2">
              <span className="text-gray-600">{phone.phoneType}:</span>
              <span className="font-medium">{phone.phoneNumber}</span>
              {phone.isPreferred && (
                <span className="text-sm text-blue-600">(Preferred)</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No phone numbers available</p>
      )}
    </div>
  );
} 