import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAssetUrl } from "../services/api";

const tabs = [
  { key: "myAuctions", label: "My auctions" },
  { key: "myBids", label: "My bids" },
  { key: "wonAuctions", label: "Won auctions" },
  { key: "lostAuctions", label: "Lost auctions" },
  { key: "watchlist", label: "Watchlist" }
];

function AuctionList({ auctions, emptyText }) {
  const navigate = useNavigate();

  if (auctions.length === 0) {
    return <p className="mb-0">{emptyText}</p>;
  }

  return (
    <div className="profile-list">
      {auctions.map((auction) => (
        <button
          key={auction.id}
          className="profile-auction-row"
          type="button"
          onClick={() => navigate(`/auction/${auction.id}`)}
        >
          {auction.image_url ? (
            <img
              className="profile-auction-image"
              src={getAssetUrl(auction.image_url)}
              alt={auction.title}
            />
          ) : (
            <span className="profile-auction-image placeholder">
              No image
            </span>
          )}

          <span className="profile-auction-copy">
            <strong>{auction.title}</strong>
            <span>{auction.creator_name || "Unknown creator"}</span>
            {auction.my_highest_bid && (
              <span>My bid: Rs. {auction.my_highest_bid}</span>
            )}
          </span>

          <span className="profile-auction-meta">
            <span className={`status-pill ${auction.status === "ENDED" ? "ended" : ""}`}>
              {auction.status}
            </span>
            <strong>Rs. {auction.current_highest_bid}</strong>
          </span>
        </button>
      ))}
    </div>
  );
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("myAuctions");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await API.get("/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setProfile(res.data);
      } catch (error) {
        console.log(error);
        navigate("/");
      }
    };

    fetchProfile();
  }, [navigate]);

  const counts = useMemo(() => {
    if (!profile) {
      return {};
    }

    return tabs.reduce((allCounts, tab) => ({
      ...allCounts,
      [tab.key]: profile[tab.key].length
    }), {});
  }, [profile]);

  if (!profile) {
    return <h2>Loading profile...</h2>;
  }

  const activeLabel =
    tabs.find((tab) => tab.key === activeTab)?.label || "Auctions";

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1 className="page-title">{profile.user?.username || "Profile"}</h1>
          <p className="page-subtitle">
            {profile.user?.email}
          </p>
        </div>
      </div>

      <section className="profile-panel">
        <div className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`profile-tab ${activeTab === tab.key ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="profile-tab-count">{counts[tab.key] || 0}</span>
            </button>
          ))}
        </div>

        <div className="profile-tab-body">
          <h2>{activeLabel}</h2>
          <AuctionList
            auctions={profile[activeTab]}
            emptyText={`No ${activeLabel.toLowerCase()} yet.`}
          />
        </div>
      </section>
    </div>
  );
}

export default Profile;
