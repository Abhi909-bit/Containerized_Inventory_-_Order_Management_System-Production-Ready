# StockFlow — Inventory & Order Management System

## Architecture
[ek simple diagram — Frontend → Nginx → Backend → PostgreSQL]

## Key Design Decisions

### Audit Trail
Every inventory mutation is logged with before/after values.
This ensures traceability for stock discrepancies.

### Order Lifecycle
Orders follow a state machine: pending → confirmed → fulfilled → cancelled.
Cancellation automatically restores inventory stock.

### Stock Validation
Stock checks happen inside a DB transaction to prevent race conditions
on concurrent orders for the same product.

## Local Setup
docker compose up --build
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs

## API Documentation
Full Swagger docs available at /docs