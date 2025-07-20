import { useState } from "react";

const RegisterPartner = ({ onBack, onNavigate }) => {
  const [partnerName, setPartnerName] = useState("");
  const [partnerUsername, setPartnerUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    if (!partnerName || !partnerUsername || !passcode) {
      setMessage("❗ All fields are required.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/register_partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_name: partnerName,
          partner_id: partnerUsername,
          passcode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Partner registered successfully!");
        setTimeout(() => onNavigate("partnerLogin"), 1500);
      } else {
        setMessage(`❌ ${data.error || "Registration failed"}`);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("🚫 Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center text-blue-700">
          Register as a Partner
        </h2>

        <input
          type="text"
          className="w-full border p-2 rounded mb-3"
          placeholder="Enter Partner Name"
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
        />

        <input
          type="text"
          className="w-full border p-2 rounded mb-3"
          placeholder="Choose a Partner ID"
          value={partnerUsername}
          onChange={(e) => setPartnerUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 rounded mb-3"
          placeholder="Create Passcode"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register Partner
        </button>

        <button
          onClick={onBack}
          className="w-full text-center text-sm text-gray-600 underline mt-3"
        >
          ← Back to Login
        </button>

        {message && (
          <p className="mt-3 text-center text-sm text-red-600 whitespace-pre-wrap">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPartner;
