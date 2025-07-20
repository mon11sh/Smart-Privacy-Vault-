const PartnerRegister = ({ onNavigate }) => {
  return (
    <div className="p-10 text-center">
      <h2 className="text-2xl font-bold">Partner Registration</h2>
      <p className="mt-2">This is where your partner registration form will go.</p>
      <button
        onClick={() => onNavigate("login")}
        className="mt-4 text-blue-600 underline"
      >
        Back to Login
      </button>
    </div>
  );
};

export default PartnerRegister;
