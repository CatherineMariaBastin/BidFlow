/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../services/socket";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/messages", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessages(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const handleWinnerMessage = (payload) => {
      setMessages((currentMessages) => [
        {
          id: payload.id || `live-${Date.now()}`,
          auction_id: payload.auctionId,
          title: payload.title || "Auction Won",
          body:
            payload.message ||
            "Congratulations, you won the auction!",
          is_read: 0,
          created_at: new Date().toISOString()
        },
        ...currentMessages
      ]);
    };

    socket.on("winnerMessage", handleWinnerMessage);

    return () => {
      socket.off("winnerMessage", handleWinnerMessage);
    };
  }, []);

  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem("token");

      await API.patch(
        `/messages/${messageId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? {
                ...message,
                is_read: 1
              }
            : message
        )
      );

      window.dispatchEvent(new Event("messagesUpdated"));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">
            Auction updates and winner notifications for your account.
          </p>
        </div>
      </div>

      <section className="messages-panel">
        {loading ? (
          <p className="mb-0">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="mb-0">No messages yet.</p>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={`message-item ${message.is_read ? "" : "unread"}`}
            >
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h3 className="message-title">
                    {message.title}
                  </h3>

                  {!message.is_read && (
                    <span className="message-badge">New</span>
                  )}
                </div>

                <p className="message-body">
                  {message.body}
                </p>

                <p className="message-meta">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>

              <div className="message-actions">
                {message.auction_id && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    type="button"
                    onClick={() => navigate(`/auction/${message.auction_id}`)}
                  >
                    View Auction
                  </button>
                )}

                {!message.is_read && (
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    onClick={() => markAsRead(message.id)}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default Messages;
