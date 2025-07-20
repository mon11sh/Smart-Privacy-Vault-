const Home = ({ user, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          Welcome, {user} 👋
        </h1>
        <p className="text-lg text-gray-600">
          What would you like to do today?
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        <button
          onClick={() => onNavigate("add")}
          className="bg-white shadow-md rounded-2xl p-6 hover:bg-blue-50 transition duration-300 border border-blue-200"
        >
          <div className="text-blue-600 text-4xl mb-2">➕</div>
          <h3 className="text-xl font-semibold text-blue-800">Add Partner</h3>
          <p className="text-sm text-gray-500 mt-1">Register a new partner to your ecosystem.</p>
        </button>

        <button
          onClick={() => onNavigate("grant")}
          className="bg-white shadow-md rounded-2xl p-6 hover:bg-green-50 transition duration-300 border border-green-200"
        >
          <div className="text-green-600 text-4xl mb-2">🛡️</div>
          <h3 className="text-xl font-semibold text-green-800">Grant Consent</h3>
          <p className="text-sm text-gray-500 mt-1">Share specific data securely with a partner.</p>
        </button>

        <button
          onClick={() => onNavigate("dashboard")}
          className="bg-white shadow-md rounded-2xl p-6 hover:bg-purple-50 transition duration-300 border border-purple-200"
        >
          <div className="text-purple-600 text-4xl mb-2">📊</div>
          <h3 className="text-xl font-semibold text-purple-800">View Consents</h3>
          <p className="text-sm text-gray-500 mt-1">Monitor your granted consents in real time.</p>
        </button>
      </div>
    </div>
  );
};

export default Home;
