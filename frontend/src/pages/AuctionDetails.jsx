import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function AuctionDetails() {
  const { id } = useParams();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    fetchAuction();
    fetchBids();
  }, []);

  const fetchAuction = async () => {
    try {
      const res = await API.get(`/auctions/${id}`);
      setAuction(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBids = async () => {
    try {
      const res = await API.get(`/bids/${id}`);
      setBids(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const placeBid = async () => {
    try {
      const token = localStorage.getItem("token");

      await API.post(
        "/bids",
        {
          auction_id: id,
          bid_amount: bidAmount
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Bid Placed Successfully");

      setBidAmount("");

      fetchAuction();
      fetchBids();

    } catch (error) {
      console.log(error);

      alert("Failed to Place Bid");
    }
  };

  if (!auction) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{auction.title}</h1>

      <p>
        <strong>Description:</strong> {auction.description}
      </p>

      <p>
        <strong>Starting Price:</strong> ₹
        {auction.starting_price}
      </p>

      <p>
        <strong>Highest Bid:</strong> ₹
        {auction.current_highest_bid}
      </p>

      <p>
        <strong>Status:</strong> {auction.status}
      </p>

      <hr />

      <h3>Place a Bid</h3>

      <input
        type="number"
        placeholder="Enter Bid Amount"
        value={bidAmount}
        onChange={(e) =>
          setBidAmount(e.target.value)
        }
      />

      <br />
      <br />

      <button onClick={placeBid}>
        Place Bid
      </button>

      <hr />

      <h3>Bid History</h3>

      {bids.length === 0 ? (
        <p>No bids yet.</p>
      ) : (
        bids.map((bid) => (
          <div
            key={bid.id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px"
            }}
          >
            ₹{bid.bid_amount}
          </div>
        ))
      )}
    </div>
  );
}

export default AuctionDetails;