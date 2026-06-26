/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import socket from "../services/socket";

const getCurrentUserId = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    return payload.id;
  } catch (error) {
    return null;
  }
};

function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  const fetchAuction = useCallback(async () => {
    try {
      const res = await API.get(`/auctions/${id}`);
      setAuction(res.data);
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  const fetchBids = useCallback(async () => {
    try {
      const res = await API.get(`/bids/${id}`);
      setBids(res.data);
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  useEffect(() => {
    fetchAuction();
    fetchBids();
  }, [fetchAuction, fetchBids]);

  useEffect(() => {
    if (!auction) {
      return;
    }

    const updateTimer = () => {
      const remaining =
        new Date(auction.end_time).getTime() - Date.now();

      if (remaining <= 0 || auction.status === "ENDED") {
        setTimeLeft("Ended");
        return;
      }

      const totalSeconds = Math.floor(remaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [auction]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("joinAuction", id);

    const handleNewBid = (payload) => {
      setAuction((currentAuction) => {
        if (!currentAuction) {
          return currentAuction;
        }

        return {
          ...currentAuction,
          current_highest_bid: payload.current_highest_bid
        };
      });

      fetchBids();
    };

    const handleAuctionEnded = (payload) => {
      if (String(payload.auctionId) !== String(id)) {
        return;
      }

      setAuction((currentAuction) => {
        if (!currentAuction) {
          return currentAuction;
        }

        return {
          ...currentAuction,
          status: "ENDED",
          winner_name: payload.winner_name || payload.winner,
          current_highest_bid:
            payload.winning_bid || currentAuction.current_highest_bid
        };
      });

      setTimeLeft("Ended");
    };

    socket.on("newBid", handleNewBid);
    socket.on("auctionEnded", handleAuctionEnded);

    return () => {
      socket.emit("leaveAuction", id);
      socket.off("newBid", handleNewBid);
      socket.off("auctionEnded", handleAuctionEnded);
    };
  }, [fetchBids, id]);

  const placeBid = () => {
    const token = localStorage.getItem("token");

    socket.emit(
      "placeBid",
      {
        token,
        auction_id: id,
        bid_amount: bidAmount
      },
      (response) => {
        if (!response.ok) {
          alert(response.message || "Failed to Place Bid");
          return;
        }

        alert("Bid Placed Successfully");
        setBidAmount("");
      }
    );
  };

  const deleteAuction = async () => {
    const confirmed = window.confirm(
      "Delete this ended auction and its bids?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.delete(`/auctions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert("Auction deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to delete auction"
      );
    }
  };

  if (!auction) {
    return <h2>Loading...</h2>;
  }

  const hasEnded = auction.status === "ENDED" || timeLeft === "Ended";
  const currentUserId = getCurrentUserId();
  const isCreator = String(auction.creator_id) === String(currentUserId);
  const canDeleteAuction = auction.status === "ENDED" && isCreator;
  const canPlaceBid = !hasEnded && !isCreator;
  const winnerName = auction.winner_name || auction.winner;

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1 className="page-title">{auction.title}</h1>
          <p className="page-subtitle">
            {auction.description}
          </p>
        </div>

        <span
          className={`status-pill ${auction.status === "ENDED" ? "ended" : ""}`}
        >
          {auction.status}
        </span>
      </div>

      <div className="details-layout">
        <section className="details-panel">

      <p>
        <strong>Description:</strong> {auction.description}
      </p>

      <p>
        <strong>Starting Price:</strong> Rs. {auction.starting_price}
      </p>

      <p>
        <strong>Highest Bid:</strong> Rs. {auction.current_highest_bid}
      </p>

      <p>
        <strong>Created By:</strong>{" "}
        {auction.creator_name || "Unknown creator"}
        {auction.creator_email && ` (${auction.creator_email})`}
      </p>

      <p>
        <strong>Status:</strong> {auction.status}
      </p>

      <p>
        <strong>Time Left:</strong> {timeLeft}
      </p>

      {hasEnded && (
        <p>
          <strong>Winner:</strong>{" "}
          {winnerName || "No winner"}
        </p>
      )}

      {canDeleteAuction && (
        <button
          className="btn btn-danger mb-3"
          type="button"
          onClick={deleteAuction}
        >
          Delete Auction
        </button>
      )}

      </section>

      <aside className="details-panel">
      <h3>Place a Bid</h3>

      {isCreator && (
        <p className="text-muted">
          You created this auction, so you cannot place bids on it.
        </p>
      )}

      <input
        className="form-control"
        type="number"
        placeholder="Enter Bid Amount"
        value={bidAmount}
        disabled={!canPlaceBid}
        onChange={(e) =>
          setBidAmount(e.target.value)
        }
      />

      <br />
      <br />

      <button
        className="btn btn-primary w-100"
        onClick={placeBid}
        disabled={!canPlaceBid}
      >
        Place Bid
      </button>
      </aside>
      </div>

      <section className="history-panel mt-4">
      <h3>Bid History</h3>

      {bids.length === 0 ? (
        <p>No bids yet.</p>
      ) : (
        bids.map((bid) => (
          <div
            key={bid.id}
            className="bid-row"
          >
            <span className="bid-amount">Rs. {bid.bid_amount}</span>
            <span>{bid.username || "Unknown bidder"}</span>
          </div>
        ))
      )}
      </section>
    </div>
  );
}

export default AuctionDetails;
