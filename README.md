
# LiveDrop Starter (TypeScript + Express + Postgres + Redis)

A minimal backend scaffold for the "**Live Drops — Flash-Sale & Follow Platform**" system design.
This repo focuses on core requirements: follows, browse, drops, **atomic stock** updates, and **idempotent** orders.

## Features

- **Users & Creators** with follow/unfollow + paginated lists
- **Products & Drops**: create products, schedule drops; cached stock in Redis
- **Atomic stock decrement** via Redis Lua (prevents oversell)
- **Idempotent orders** using `Idempotency-Key` + Redis + DB uniqueness
- **REST API** behind a single service (can be split into microservices later)
- **Docker** for Postgres/Redis; simple migration runner
- **Auth**: developer login endpoint returning a JWT (for demo)

## Run locally

```bash
cp .env.example .env
docker compose up -d postgres redis
npm install
npm run migrate:up
npm run dev
# API at http://localhost:4000
```

Or run all in Docker:

```bash
docker compose up
```

## Quick flow (demo)

1. **Create a creator**
```bash
curl -X POST http://localhost:4000/creators -H 'Content-Type: application/json' -d '{"handle":"alice","display_name":"Alice Artist"}'
```
2. **Create a user & get token**
```bash
curl -X POST http://localhost:4000/users/auth/dev -H 'Content-Type: application/json' -d '{"handle":"bob"}'
# => token + userId
```
3. **Follow the creator**
```bash
curl -X POST http://localhost:4000/users/<<userId>>/follow/<<creatorId>>
```
4. **Create a product**
```bash
curl -X POST http://localhost:4000/products -H 'Content-Type: application/json' -d '{"creator_id":"<<creatorId>>","title":"Sticker Pack","description":"Glossy","price_cents":899}'
```
5. **Schedule a drop** (also initializes Redis stock)
```bash
curl -X POST http://localhost:4000/drops -H 'Content-Type: application/json' -d '{"product_id":"<<productId>>","creator_id":"<<creatorId>>","start_time":"2025-09-14T10:00:00Z","end_time":"2025-09-14T12:00:00Z","initial_stock":10,"low_stock_threshold":3}'
```
6. **Place an order (idempotent)**
Use the same `Idempotency-Key` to retry safely.
```bash
curl -X POST http://localhost:4000/orders -H 'Content-Type: application/json' -H 'Idempotency-Key: abc123' -d '{"user_id":"<<userId>>","drop_id":"<<dropId>>","product_id":"<<productId>>","qty":1,"amount_cents":899}'
```

## API Overview

### Users & Follows
- `POST /users/auth/dev` → `{ handle }` → returns `{ token, userId }`
- `POST /users/:userId/follow/:creatorId`
- `DELETE /users/:userId/follow/:creatorId`
- `GET /users/:userId/following?page=&limit=`
- `GET /creators/:creatorId/followers?page=&limit=`

### Creators
- `POST /creators` → `{ handle, display_name }`

### Products
- `POST /products` → `{ creator_id, title, description?, price_cents }`
- `GET /products?creator_id=&page=&limit=`

### Drops
- `POST /drops` → `{ product_id, creator_id, start_time, end_time, initial_stock, low_stock_threshold? }`
- `GET /drops?status=&page=&limit=`
- `GET /drops/:id/stock`

### Orders
- `POST /orders` (requires `Idempotency-Key` header) → `{ user_id, drop_id, product_id, qty, amount_cents }`
- `GET /orders/:id`

## Notes on Consistency & Caching

- **Authoritative stock** lives in Redis for speed; initialize `stock:{dropId}` when the drop is created.
- The Redis **Lua script** ensures: single-step check-then-decrement; stores an idempotency record with TTL.
- DB `orders` has a **unique** constraint on `(idempotency_key, user_id)` as a second layer.
- Drop `status` is updated to `sold_out` when remaining hits zero (starter logic).

## Next Steps (extend this repo)
- Add **Notification Service** (WebSockets + fan-out by follower shards)
- Periodically sync Redis stock back to DB for durability/auditing
- Add search/filtering for browsing
- Implement auth middleware on sensitive routes
- Split monolith by domain into separate services
- Add rate limiting and OpenAPI spec
- Add tests
- Add Kafka/PubSub for event-driven notifications

## License
MIT
