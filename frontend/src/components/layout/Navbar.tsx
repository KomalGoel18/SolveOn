// src/components/layout/Navbar.tsx
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type NavbarProps = {
  currentPage?: string;
  onNavigate?: (page: string, data?: any) => void;
};

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const go = (page: string) => {
    if (onNavigate) onNavigate(page);
    else {
      // router paths used by the app
      switch (page) {
        case "dashboard":
          navigate("/dashboard");
          break;
        case "problems":
          navigate("/problems");
          break;
        case "leaderboard":
          navigate("/leaderboard");
          break;
        default:
          navigate("/");
      }
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
  {/* Left Section */}
  <div className="flex items-center space-x-6">
    <div
      className="text-xl font-bold text-white cursor-pointer tracking-wide"
      onClick={() => go("dashboard")}
    >
      SolveOn
    </div>

    <div className="hidden md:flex items-center space-x-4 text-sm">
      <button
        onClick={() => go("dashboard")}
        className={`px-3 py-1 rounded transition ${
          currentPage === "dashboard"
            ? "text-blue-400"
            : "text-gray-400 hover:text-white"
        }`}
      >
        Dashboard
      </button>

      <button
        onClick={() => go("problems")}
        className={`px-3 py-1 rounded transition ${
          currentPage === "problems"
            ? "text-blue-400"
            : "text-gray-400 hover:text-white"
        }`}
      >
        Problems
      </button>

      <button
        onClick={() => go("leaderboard")}
        className={`px-3 py-1 rounded transition ${
          currentPage === "leaderboard"
            ? "text-blue-400"
            : "text-gray-400 hover:text-white"
        }`}
      >
        Leaderboard
      </button>
    </div>
  </div>

  {/* Right Section */}
  <div className="flex items-center space-x-4 text-sm">
    {user && (
      <span className="text-gray-400 hidden sm:block">
        {user.username ?? user.email}
      </span>
    )}

    {user ? (
      <button
        onClick={() => {
          signOut();
          navigate("/login");
        }}
        className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition"
      >
        Sign out
      </button>
    ) : (
      <button
        onClick={() => navigate("/login")}
        className="px-3 py-1 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
      >
        Login
      </button>
    )}
  </div>
</nav>
  );
}
