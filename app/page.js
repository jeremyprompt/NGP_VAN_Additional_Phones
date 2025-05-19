import ContactDisplay from '../components/ContactDisplay';

export default async function Home() {
  let contact = null;
  let error = null;

  try {
    const response = await fetch('/api/contacts');
    if (!response.ok) {
      throw new Error('Failed to fetch contact information');
    }
    const data = await response.json();
    contact = data.items?.[0] || null;
  } catch (err) {
    error = err.message;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Contact Information</h1>
        {error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : (
          <ContactDisplay contact={contact} />
        )}
      </div>
    </main>
  );
} 