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

# Message APIs

GET /api/messages
PATCH /api/messages/:id/read

# Real-Time Events (Socket.IO)

joinAuction
Payload: auctionId

leaveAuction
Payload: auctionId

placeBid
Payload:
{
  token,
  auction_id,
  bid_amount
}

newBid
Payload:
{
  bid,
  current_highest_bid
}

auctionEnded
Payload:
{
  auctionId,
  winner,
  winner_name,
  winning_bid
}

winnerMessage
Payload:
{
  id,
  auctionId,
  auctionTitle,
  title,
  message,
  winning_bid
}
