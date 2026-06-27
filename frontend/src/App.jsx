import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAuction from "./pages/CreateAuction";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AuctionDetails from "./pages/AuctionDetails";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="app-main">
        {children}
      </main>
    </>
  );
}

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
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />

        <Route
          path="/create-auction"
          element={
            <AppLayout>
              <CreateAuction />
            </AppLayout>
          }
        />

        <Route
          path="/auction/:id"
          element={
            <AppLayout>
              <AuctionDetails />
            </AppLayout>
          }
        />

        <Route
          path="/messages"
          element={
            <AppLayout>
              <Messages />
            </AppLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <AppLayout>
              <Profile />
            </AppLayout>
          }
        />

        <Route
          path="*"
          element={<Login />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
