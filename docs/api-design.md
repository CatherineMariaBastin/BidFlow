# Authentication APIs

POST /api/auth/register
POST /api/auth/login

# Auction APIs

POST /api/auctions
GET /api/auctions
GET /api/auctions/:id

# Bid APIs

POST /api/bids
GET /api/bids/:auctionId

# Real-Time Events (Socket.IO)

joinAuction
newBid
auctionEnded