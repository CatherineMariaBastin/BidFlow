import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../services/socket";

function Navbar() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return undefined;
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await API.get("/messages", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUnreadCount(
          res.data.filter((message) => !message.is_read).length
        );
      } catch (error) {
        console.log(error);
      }
    };

    fetchUnreadCount();
    window.addEventListener("messagesUpdated", fetchUnreadCount);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("authenticate", token);

    const handleWinnerMessage = (payload) => {
      setUnreadCount((currentCount) => currentCount + 1);
      alert(payload.message || "Congratulations, you won the auction!");
    };

    socket.on("winnerMessage", handleWinnerMessage);

    return () => {
      socket.off("winnerMessage", handleWinnerMessage);
      window.removeEventListener("messagesUpdated", fetchUnreadCount);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    socket.disconnect();
    navigate("/");
  };

  return (
    <header className="app-header">
      <nav className="app-nav">
        <button
          className="brand-button"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <span className="brand-mark">B</span>
          <span>BidFlow</span>
        </button>

        <div className="nav-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link-item ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/create-auction"
            className={({ isActive }) =>
              `nav-link-item ${isActive ? "active" : ""}`
            }
          >
            Create Auction
          </NavLink>

          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `nav-link-item ${isActive ? "active" : ""}`
            }
          >
            Messages
            {unreadCount > 0 && (
              <span className="nav-count">{unreadCount}</span>
            )}
          </NavLink>
        </div>

        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          onClick={logout}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
