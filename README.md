# Trade Exchange

A cryptocurrency spot exchange built using **NestJS, TypeScript, MySQL, and Angular**, implementing core exchange functionality including order management, order matching, trade execution, and settlement.

## Key Features

- **Order Management:** Create and cancel BUY/SELL orders with LIMIT and MARKET order types.
- **Matching Engine:** Price-time-priority matching, partial fills, multiple executions, and maker/taker identification.
- **Order Book:** Maintains open orders, prioritizes prices, and preserves order arrival time.
- **Trade Service:** Records executions, calculates trading fees and applicable TDS, and maintains trade history.
- **Settlement:** Transfers assets between buyers and sellers based on completed trades.
- **Wallet & Currency:** Manages user wallets, balances, and funds reserved for open orders.
- **Market Data:** Manages trading pairs and calculates current prices, 24-hour high/low, volume, and price change.
- **Angular Frontend:** Provides a trading interface for interacting with the exchange.

## Tech Stack

**Backend:** NestJS, TypeScript, Node.js  
**Database:** MySQL, TypeORM  
**Authentication:** JWT, Passport  
**Frontend:** Angular, HTML, SCSS  
**Tools:** Git, GitHub, Postman, Swagger

## How It Works

```text
User Places Order
       ↓
   Order Service
       ↓
  Matching Engine
       ↕
    Order Book
       ↓
   Trade Service
       ↓
 ┌─────┴─────────┐
 ↓               ↓
Settlement    Market Data
 ↓               ↓
Wallets       Market Ticker
```

The matching engine finds compatible BUY and SELL orders, executes trades at the resting order's price, and supports partial fills. The Trade Service records each execution and calculates applicable fees and TDS, while the Settlement Service handles asset transfers. Completed trades feed into the Market Service to update market prices and 24-hour statistics.

## Getting Started

**Prerequisites:** Node.js, npm, and MySQL.

Clone the repository and install dependencies:

```bash
git clone https://github.com/Shxrlixn/trade-exchange.git
cd trade-exchange
npm install
```

Configure your environment variables and MySQL database, then start the backend:

```bash
npm run start:dev
```

To run the Angular frontend separately:

```bash
cd frontend
npm install
ng serve
```

## Future Enhancements

- **WebSockets:** Real-time prices, order-book updates, trades, and wallet updates.
- **Kafka:** Asynchronous communication between trade, settlement, and market services.
- **Redis:** Market-data caching and support for distributed WebSocket communication.
- **Reliability:** Stronger concurrency control, failure recovery, and automated testing.

*Redis, Kafka, and the trading WebSocket layer are planned enhancements and are not yet integrated.*

---

**Built to explore the core engineering behind a cryptocurrency exchange, with a focus on order matching, financial consistency, and modular backend architecture.**
