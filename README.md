# BidFlow
# BidFlow

Real-time auction platform built with:

- React.js
- Node.js
- Express.js
- MySQL
- Socket.IO

Features:
- User Login/Register
- Create Auction
- Join Auction
- Place Bid
- Real-Time Bid Updates
- Auction Timer
- Winner Declaration

## Shared data across systems

Auctions and bids are stored in MySQL through the backend API. For every user
to see the same auctions, all browsers must connect to the same backend server,
and that backend must connect to the same MySQL database.

Do not keep the frontend pointed at `localhost` or `127.0.0.1` on multiple
computers. On each computer, `localhost` means that same computer, so every
system can accidentally use its own separate backend/database.

### LAN setup

1. Run MySQL and the backend on one main machine.
2. In `backend/.env`, keep `DB_HOST=localhost` if MySQL is on that same main
   machine. If the backend is on a different machine from MySQL, set `DB_HOST`
   to the MySQL machine IP address.
3. Start the backend on the main machine:

   ```bash
   cd backend
   npm run dev
   ```

4. Find the main machine IP address, for example `192.168.1.10`.
5. On each frontend machine, create `frontend/.env`:

   ```bash
   VITE_API_BASE_URL=http://192.168.1.10:5000/api
   VITE_SOCKET_URL=http://192.168.1.10:5000
   ```

6. Start the frontend:

   ```bash
   cd frontend
   npm run dev
   ```

If you open the frontend from the main machine's Vite network URL, the app will
also default to that same host for API and Socket.IO requests.
