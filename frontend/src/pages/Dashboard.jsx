/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import API from "../services/api";
import { getAssetUrl } from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();

  const fetchAuctions = async () => {
    try {
      const res = await API.get("/auctions");
      setAuctions(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>

      <section className="hero-panel">
        <h1 className="page-title">Welcome to BidFlow</h1>
        <p className="mb-0">
          Real-Time Auction Platform for Smart Bidding
        </p>

        <div className="stat-grid">
          <div className="stat-box">
            <p className="stat-label">Total Auctions</p>
            <p className="stat-value">{auctions.length}</p>
          </div>

          <div className="stat-box">
            <p className="stat-label">Active</p>
            <p className="stat-value">
              {auctions.filter((auction) => auction.status === "ACTIVE").length}
            </p>
          </div>

          <div className="stat-box">
            <p className="stat-label">Ended</p>
            <p className="stat-value">
              {auctions.filter((auction) => auction.status === "ENDED").length}
            </p>
          </div>
        </div>
      </section>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Live Auctions</h2>

        <div>
          <button
            className="btn btn-primary me-2"
            onClick={() => navigate("/create-auction")}
          >
            Create Auction
          </button>

          <button
            className="btn btn-danger"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="row">
        {auctions.length === 0 ? (
          <p>No auctions available.</p>
        ) : (
          auctions.map((auction) => (
            <div
              key={auction.id}
              className="col-md-4 mb-4"
            >
              <div className="auction-card">
                {auction.image_url ? (
                  <img
                    className="auction-card-image"
                    src={getAssetUrl(auction.image_url)}
                    alt={auction.title}
                  />
                ) : (
                  <div className="auction-card-image placeholder">
                    No image
                  </div>
                )}

                <div className="card-body">

                  <div className="d-flex justify-content-between mb-2">
                    <h5 className="card-title">
                      {auction.title}
                    </h5>

                    <span
                      className={`status-pill ${
                        auction.status === "ENDED" ? "ended" : ""
                      }`}
                    >
                      {auction.status}
                    </span>
                  </div>

                  <p className="card-text">
                    {auction.description}
                  </p>

                  <p>
                    <strong>Starting Price:</strong>
                    <br />
                    Rs. {auction.starting_price}
                  </p>

                  <p>
                    <strong>Created By:</strong>
                    <br />
                    {auction.creator_name || "Unknown"}
                  </p>

                  {auction.status === "ENDED" && (
                    <p>
                      <strong>Winner:</strong>
                      <br />
                      {auction.winner_name || "No winner"}
                    </p>
                  )}

                  <p>
                    <strong>Highest Bid:</strong>
                    <br />
                    <span className="text-success fw-bold">
                      Rs. {auction.current_highest_bid}
                    </span>
                  </p>

                  <button
                    className="btn btn-success w-100"
                    onClick={() =>
                      navigate(`/auction/${auction.id}`)
                    }
                  >
                    View Auction
                  </button>

                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Dashboard;
