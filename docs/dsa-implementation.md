# DSA Concepts Used in BidFlow

## 1. Running Maximum for Highest Bid

BidFlow stores the current highest bid in the `auctions.current_highest_bid`
column.

Instead of scanning every bid whenever the auction page is opened, the system
updates this value only when a valid higher bid arrives.

Time complexity:

```txt
Find highest bid by scanning bids: O(n)
Read current_highest_bid: O(1)
Update when a higher bid arrives: O(1)
```

Implementation file:

```txt
backend/services/auctionService.js
```

Main rule:

```txt
if newBid <= currentHighestBid:
    reject bid
else:
    accept bid and update currentHighestBid
```

## 2. HashMap-Like Auction Rooms

Socket.IO rooms are used so every auction has its own real-time communication
channel.

Conceptually:

```txt
auctionId -> connected users
```

Example:

```txt
auction-1 -> user A, user B
auction-2 -> user C
```

When a new bid is placed, only users inside that auction room receive the
`newBid` event.

Implementation files:

```txt
backend/server.js
frontend/src/pages/AuctionDetails.jsx
frontend/src/services/socket.js
```

Events:

```txt
joinAuction
leaveAuction
placeBid
newBid
auctionEnded
```

## 3. Max Selection for Winner Declaration

When an auction ends, the winner is selected from the highest bid.

The SQL query sorts bids by bid amount and picks the top bid:

```sql
SELECT bidder_id, bid_amount
FROM bids
WHERE auction_id = ?
ORDER BY bid_amount DESC, bid_time ASC
LIMIT 1;
```

DSA concept:

```txt
Maximum element selection
```

For larger systems, this can be optimized further using a max heap. In this
project, the running maximum and database ordering are enough for the current
scope.

## 4. Priority Queue Concept for Auction Timer

Expired auctions are processed by earliest ending time:

```sql
SELECT id
FROM auctions
WHERE status = 'ACTIVE' AND end_time <= NOW()
ORDER BY end_time ASC;
```

This follows the same idea as a min heap or priority queue:

```txt
Auction with nearest end_time gets processed first
```

Current implementation:

```txt
setInterval(checkExpiredAuctions, 10000)
```

This checks every 10 seconds for auctions that should end.

## 5. List for Bid History

Each auction has a bid history stored in the `bids` table.

The frontend displays this as a list ordered by highest bid first.

Implementation files:

```txt
backend/services/auctionService.js
frontend/src/pages/AuctionDetails.jsx
```

Query:

```sql
SELECT bids.*, users.username
FROM bids
JOIN users ON users.id = bids.bidder_id
WHERE bids.auction_id = ?
ORDER BY bids.bid_amount DESC;
```

