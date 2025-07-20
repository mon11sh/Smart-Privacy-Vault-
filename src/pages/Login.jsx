import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";

const Login = ({ onLogin, onNavigate }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAuth = async () => {
    setError("");
    if (!username || !password || (isRegister && !confirmPassword)) {
      setError("All fields are required.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const url = isRegister
      ? "http://127.0.0.1:5000/register"
      : "http://127.0.0.1:5000/login";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        onLogin(username);
      } else {
        setError(data.error || (isRegister ? "Registration failed" : "Login failed"));
      }
    } catch (err) {
      setError("Network error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
        <div className="text-center mb-6">
          <img
            src="https://img.icons8.com/emoji/48/egg-emoji.png"
            alt="VaultKey"
            className="mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-gray-800">
            {isRegister ? "Register for VaultKey" : "VaultKey Login"}
          </h1>
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Username</label>
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FaUser className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Password</label>
          <div className="relative">
            <input
              type="password"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {isRegister && (
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FaLock className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        )}

        {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition"
        >
          {loading
            ? isRegister
              ? "Registering..."
              : "Logging in..."
            : isRegister
            ? "Register"
            : "Sign In"}
        </button>

        <div className="text-center text-sm mt-4 text-blue-600 underline">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="hover:text-blue-800 transition"
          >
            {isRegister
              ? "Already have an account? Login here"
              : "New? Register here"}
          </button>
        </div>

        {/* Partner Options */}
        <div className="mt-6 text-center space-y-2">
          <button
            onClick={() => onNavigate("partnerRegister")}
            className="text-sm text-purple-600 underline hover:text-purple-800"
          >
            🧾 Register as Partner
          </button>
          <br />
          <button
            onClick={() => onNavigate("partnerLogin")}
            className="text-sm text-indigo-600 underline hover:text-indigo-800"
          >
            🔑 Login as Partner
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
