const Navbar = ({ onNavigate }) => {
  return (
    <nav className="bg-gray-100 px-4 py-2 shadow mb-6 flex items-center justify-between">
      <span className="text-lg font-semibold">CanaraVerGPT</span>
      <button
        onClick={() => onNavigate("home")}
        className="text-blue-600 hover:underline"
      >
        🏠 Return to Home
      </button>
    </nav>
  );
};

export default Navbar;
