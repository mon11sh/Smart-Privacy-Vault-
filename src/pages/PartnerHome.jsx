import { useState, useEffect } from "react";

const PartnerHome = ({ partnerId, onLogout }) => {
  const [tokenInput, setTokenInput] = useState("");
  const [tokens, setTokens] = useState([]);
  const [redeemedData, setRedeemedData] = useState(null);
  const [error, setError] = useState("");

  // Fetch all tokens issued to this partner
  useEffect(() => {
    fetch("http://localhost:5000/get_partner_tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ partner_id: partnerId })
, // use partnerId passed from login
    })
      .then((res) => res.json())
      .then((data) => {
        setTokens(data.tokens || []);
      })
      .catch((err) => console.error("Error fetching tokens:", err));
  }, [partnerId]);

  // Redeem a token and get the actual data
  const handleRedeem = () => {
    setError("");
    setRedeemedData(null);

    fetch("http://localhost:5000/use_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token_id: tokenInput, partner: partnerId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setRedeemedData(data);
        }
      })
      .catch((err) => setError("Something went wrong!"));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Welcome Partner: {partnerId}</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Paste Token ID here"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      <button
        onClick={handleRedeem}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Redeem Token
      </button>

      {error && (
        <div className="mt-4 text-red-500 font-semibold">
          ❌ {error}
        </div>
      )}

      {redeemedData && (
        <div className="mt-4 border p-4 rounded bg-gray-100">
          <h2 className="font-bold">✅ Redeemed Data:</h2>
          <p>Data Type: {redeemedData.data_type}</p>
          <p>Value: {redeemedData.value}</p>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Available Tokens:</h2>
        <ul className="space-y-2">
          {tokens.map((token) => (
            <li
              key={token.token_id}
              className="border p-3 rounded bg-white shadow-sm"
            >
              <p><strong>Token ID:</strong> {token.token_id}</p>
              <p><strong>User:</strong> {token.username}</p>
              <p><strong>Data Type:</strong> {token.data_type}</p>
              <p><strong>Expires:</strong> {new Date(token.expires_at).toLocaleString()}</p>
              <p>
                <strong>Status:</strong>{" "}
                {token.revoked
                  ? "Revoked ❌"
                  : token.expired
                  ? "Expired ⌛"
                  : "Valid ✅"}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 text-right">
        <button onClick={onLogout} className="text-sm text-red-500 underline">
          Logout
        </button>
      </div>
    </div>
  );
};

export default PartnerHome;
