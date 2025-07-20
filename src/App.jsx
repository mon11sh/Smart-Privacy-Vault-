import { useState, useEffect } from "react";

import Login from "./pages/Login";
import RegisterPartner from "./pages/RegisterPartner";
import LoginPartner from "./pages/LoginPartner";
import PartnerHome from "./pages/PartnerHome";
import PartnerRegister from "./components/PartnerRegister";
import PartnerLogin from "./components/PartnerLogin";

import AddPartner from "./pages/AddPartner";
import GrantConsent from "./pages/GrantConsent";
import ConsentDashboard from "./pages/ConsentDashboard";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [page, setPage] = useState("home");
  const [mode, setMode] = useState("login");

  // Debug logs — remove in production
  useEffect(() => {
    console.log("Current state:", { user, partner, page, mode });
  }, [user, partner, page, mode]);

  // --- LOGIN FLOW ---
  if (!user && !partner) {
    switch (mode) {
      case "login":
        return (
          <Login
            onLogin={setUser}
            onNavigate={(targetMode) => setMode(targetMode)} // ✅ login → partnerLogin/register
          />
        );

      case "partnerLogin":
        return (
          <LoginPartner
            onPartnerLogin={setPartner}
            onBack={() => setMode("login")}
          />
        );

      case "partnerRegister":
        return (
          <RegisterPartner
            onBack={() => setMode("login")}
            onNavigate={() => setMode("partnerLogin")} // ✅ register → loginPartner
          />
        );

      default:
        console.warn("Invalid mode:", mode);
        setMode("login"); // Fallback to login
        return <div>Loading...</div>;
    }
  }

  // --- PARTNER VIEW ---
  if (partner && !user) {
    return (
      <PartnerHome
        partnerId={partner}
        onLogout={() => {
          setPartner(null);
          setMode("login");
        }}
      />
    );
  }

  // --- USER VIEW ---
  let content;
  switch (page) {
    case "add":
      content = <AddPartner user={user} onNavigate={setPage} />;
      break;
    case "grant":
      content = <GrantConsent user={user} onNavigate={setPage} />;
      break;
    case "dashboard":
      content = <ConsentDashboard user={user} onNavigate={setPage} />;
      break;
    case "home":
    default:
      content = <Home user={user} onNavigate={setPage} />;
      break;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Welcome{user ? `, ${user}` : ""}!
        </h1>
        <button
          onClick={() => {
            setUser(null);
            setPage("home");
            setMode("login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <Navbar onNavigate={setPage} />
      {content}
    </div>
  );
}

export default App;
