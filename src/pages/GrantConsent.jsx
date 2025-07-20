import { useEffect, useState } from "react";

const GrantConsent = ({ user }) => {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [dataType, setDataType] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/get_partners?username=${user}`);
        const data = await res.json();
        console.log("📦 RAW RESPONSE:", data);

        if (res.ok && Array.isArray(data.partners)) {
          setPartners(data.partners);
        } else {
          console.error("❌ Invalid format or empty partners:", data);
          setPartners([]);
        }
      } catch (error) {
        console.error("🔥 Fetch error:", error);
        setPartners([]);
      }
    };

    if (user) {
      fetchPartners();
    }
  }, [user]);

  const handleGrant = async () => {
    if (!selectedPartner || !dataType) {
      setMessage("❗ All fields are required");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/grant_consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          partner: selectedPartner,
          data_type: dataType
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Token generated:\n${JSON.stringify(data.token, null, 2)}`);
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to grant consent"}`);
      }
    } catch (err) {
      setMessage("🚫 Network or server error");
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Grant Consent
      </h2>

      {/* Partner Dropdown */}
      <select
        className="w-full p-3 mb-6 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={selectedPartner}
        onChange={(e) => setSelectedPartner(e.target.value)}
      >
        <option value="">🔽 Select Partner</option>
        {partners.map((p, idx) => (
          <option key={idx} value={p}>
            {p}
          </option>
        ))}
      </select>

      {/* Data Type Dropdown */}
      <select
        className="w-full p-3 mb-6 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={dataType}
        onChange={(e) => setDataType(e.target.value)}
      >
        <option value="">🔽 Select Data Type</option>
        <option value="salary">Salary</option>
        <option value="credit_score">Credit Score</option>
        <option value="account_balance">Account Balance</option>
        <option value="transactions">Transactions</option>
      </select>

      {/* Submit Button */}
      <button
        onClick={handleGrant}
        className="bg-blue-600 w-full text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
      >
        🛡️ Grant Consent
      </button>

      {/* Message Display */}
      {message && (
        <pre className="mt-6 bg-gray-100 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">
          {message}
        </pre>
      )}
    </div>
  );
};

export default GrantConsent;
