import { useState } from "react";

const LoginPartner = ({ onPartnerLogin, onBack }) => {
  const [partnerId, setPartnerId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!partnerId || !passcode) {
      setMessage("❗ Both fields are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/login_partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner_id: partnerId, passcode }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Login successful");
        onPartnerLogin(partnerId); // Pass partner ID to parent
      } else {
        setMessage(`❌ ${data.error || "Login failed"}`);
      }
    } catch (err) {
      setMessage("🚫 Network or server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center text-purple-700">
          Partner Login
        </h2>

        <input
          type="text"
          className="w-full border p-2 rounded mb-3"
          placeholder="Enter Partner ID"
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 rounded mb-3"
          placeholder="Enter Passcode"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          {loading ? "Logging in..." : "Login as Partner"}
        </button>

        <button
          onClick={onBack}
          className="w-full text-center text-sm text-gray-600 underline mt-3"
        >
          ← Back to Login
        </button>

        {message && <p className="mt-3 text-center text-sm text-red-600">{message}</p>}
      </div>
    </div>
  );
};

export default LoginPartner;
