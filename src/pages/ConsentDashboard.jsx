import { useEffect, useState } from "react";

const ConsentDashboard = ({ user }) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/get_tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user }),
        });
        const data = await res.json();
        if (res.ok) {
          setTokens(data.tokens);
        } else {
          console.error("Failed to fetch tokens:", data.error);
        }
      } catch (err) {
        console.error("Error fetching tokens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [user]);

  if (loading) return <p>Loading tokens...</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Granted Consents</h2>

      {tokens.length === 0 ? (
        <p>No tokens found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Partner</th>
              <th className="border p-2">Data Type</th>
              <th className="border p-2">Expires At</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, idx) => (
              <tr key={idx}>
                <td className="border p-2">{token.partner}</td>
                <td className="border p-2">{token.data_type}</td>
                <td className="border p-2">{new Date(token.expires_at).toLocaleString()}</td>
                <td className="border p-2">
                  {token.revoked
                    ? "Revoked ❌"
                    : token.expired
                    ? "Expired ⌛"
                    : "Active ✅"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ConsentDashboard;
