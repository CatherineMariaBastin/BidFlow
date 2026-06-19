import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-dark bg-dark px-4">
      <span className="navbar-brand">
        BidFlow
      </span>

      <div>
        <Link
          to="/dashboard"
          className="btn btn-outline-light me-2"
        >
          Dashboard
        </Link>

        <Link
          to="/create-auction"
          className="btn btn-warning"
        >
          Create Auction
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;