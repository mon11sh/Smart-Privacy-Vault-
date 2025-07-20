import { useEffect, useState } from "react";

const AddPartner = ({ user }) => {
  const [availablePartners, setAvailablePartners] = useState([]);
  const [partnerName, setPartnerName] = useState("");
  const [message, setMessage] = useState("");

  // Fetch partners from backend DB on mount
  useEffect(() => {
    fetch("http://127.0.0.1:5000/all_partners")
      .then((res) => res.json())
      .then((data) => {
        if (data.partners) {
          setAvailablePartners(data.partners);
        } else {
          setMessage("⚠️ No partners found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching partners:", err);
        setMessage("🚫 Failed to fetch partners");
      });
  }, []);

  // Add selected partner
  const handleAddPartner = async () => {
    if (!partnerName) {
      setMessage("❗ Please select a partner");
      return;
    }

    const res = await fetch("http://127.0.0.1:5000/add_partner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user,
        partner_name: partnerName,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(`✅ Partner "${partnerName}" added!`);
      setPartnerName("");
    } else {
      setMessage(data.error || "❌ Failed to add partner");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Add Data Partner
      </h2>

      {/* Dropdown with partner names from DB */}
      <select
        className="border border-gray-300 p-3 w-full mb-6 rounded-xl"
        value={partnerName}
        onChange={(e) => setPartnerName(e.target.value)}
      >
        <option value="">🔽 Select a registered partner</option>
        {availablePartners.map((name, idx) => (
          <option key={idx} value={name}>
            {name}
          </option>
        ))}
      </select>

      <button
        onClick={handleAddPartner}
        className="bg-blue-600 w-full text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
      >
        ➕ Add Partner
      </button>

      {message && (
        <p className="mt-4 text-center text-sm font-medium text-gray-700">
          {message}
        </p>
      )}
    </div>
  );
};

export default AddPartner;
