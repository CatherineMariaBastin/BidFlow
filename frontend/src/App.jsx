import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAuction from "./pages/CreateAuction";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AuctionDetails from "./pages/AuctionDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/create-auction"
          element={<CreateAuction />}
        />

        <Route
          path="/auction/:id"
          element={<AuctionDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;