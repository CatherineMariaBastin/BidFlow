import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const res = await API.get("/auctions");
      setAuctions(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="container mt-4">

      {/* Hero Section */}
      <div className="bg-dark text-white p-5 rounded mb-4 shadow">
        <h1>Welcome to BidFlow</h1>
        <p className="mb-0">
          Real-Time Auction Platform for Smart Bidding
        </p>
      </div>

      {/* Top Buttons */}
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

      {/* Auction Cards */}
      <div className="row">
        {auctions.length === 0 ? (
          <p>No auctions available.</p>
        ) : (
          auctions.map((auction) => (
            <div
              key={auction.id}
              className="col-md-4 mb-4"
            >
              <div className="card shadow h-100">
                <div className="card-body">

                  <div className="d-flex justify-content-between mb-2">
                    <h5 className="card-title">
                      {auction.title}
                    </h5>

                    <span className="badge bg-success">
                      {auction.status}
                    </span>
                  </div>

                  <p className="card-text">
                    {auction.description}
                  </p>

                  <p>
                    <strong>Starting Price:</strong>
                    <br />
                    ₹{auction.starting_price}
                  </p>

                  <p>
                    <strong>Highest Bid:</strong>
                    <br />
                    <span className="text-success fw-bold">
                      ₹{auction.current_highest_bid}
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