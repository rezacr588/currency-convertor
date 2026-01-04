# Currency Converter v2 - Architecture Plan

## Overview

A modern, full-stack currency converter application with real-time exchange rates, historical data, and a responsive PWA interface.

**Tech Stack:**
- **Backend:** Go (Golang)
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Cache:** Redis (production) / In-memory (development)
- **Deployment:** Fly.io (backend) + Vercel (frontend)

---

## Repository Structure

```
currency-converter-v2/
├── frontend/                    # React + TypeScript application
├── backend/                     # Go API server
├── shared/                      # Shared types/contracts
├── docker-compose.yml           # Local development
├── Makefile                     # Build commands
└── README.md
```

---

## Backend Architecture (Go)

### Directory Structure

```
backend/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go            # Environment configuration
│   ├── handler/
│   │   ├── handler.go           # Handler interface
│   │   ├── rates.go             # GET /api/v1/rates/:base
│   │   ├── convert.go           # GET /api/v1/convert
│   │   ├── currencies.go        # GET /api/v1/currencies
│   │   └── historical.go        # GET /api/v1/historical/:date
│   ├── middleware/
│   │   ├── cors.go              # CORS middleware
│   │   ├── logging.go           # Request logging
│   │   └── ratelimit.go         # Rate limiting
│   ├── model/
│   │   ├── currency.go          # Currency domain model
│   │   ├── rate.go              # Rate domain model
│   │   └── conversion.go        # Conversion result model
│   ├── repository/
│   │   ├── cache.go             # Cache interface
│   │   ├── redis_cache.go       # Redis implementation
│   │   ├── memory_cache.go      # In-memory implementation
│   │   └── frankfurter.go       # Frankfurter API client
│   ├── service/
│   │   └── exchange.go          # Business logic
│   └── router/
│       └── router.go            # Route definitions
├── pkg/
│   └── httputil/
│       ├── response.go          # JSON response helpers
│       └── errors.go            # Error types
├── go.mod
├── go.sum
├── Dockerfile
└── .env.example
```

### API Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/v1/currencies` | List all available currencies | `Currency[]` |
| `GET` | `/api/v1/rates/:base` | Get latest rates for base currency | `RatesResponse` |
| `GET` | `/api/v1/convert` | Convert amount between currencies | `ConversionResult` |
| `GET` | `/api/v1/historical/:date` | Get historical rates for a date | `RatesResponse` |
| `GET` | `/health` | Health check endpoint | `{ status: "ok" }` |

### Query Parameters

**GET /api/v1/convert**
- `from` (required): Source currency code (e.g., "USD")
- `to` (required): Target currency code (e.g., "EUR")
- `amount` (required): Amount to convert (e.g., 100)

**GET /api/v1/rates/:base**
- `symbols` (optional): Comma-separated currency codes to filter

### Response Models

```go
// Currency represents a currency with metadata
type Currency struct {
    Code     string `json:"code"`
    Name     string `json:"name"`
    Symbol   string `json:"symbol"`
    Priority int    `json:"priority"`
}

// Rate represents an exchange rate
type Rate struct {
    Code   string  `json:"code"`
    Name   string  `json:"name"`
    Rate   float64 `json:"rate"`
    Change float64 `json:"change,omitempty"`
}

// RatesResponse is the response for rates endpoints
type RatesResponse struct {
    Base      string    `json:"base"`
    Date      string    `json:"date"`
    Rates     []Rate    `json:"rates"`
    UpdatedAt time.Time `json:"updated_at"`
}

// ConversionResult is the response for convert endpoint
type ConversionResult struct {
    From      string    `json:"from"`
    To        string    `json:"to"`
    Amount    float64   `json:"amount"`
    Result    float64   `json:"result"`
    Rate      float64   `json:"rate"`
    UpdatedAt time.Time `json:"updated_at"`
}

// ErrorResponse for API errors
type ErrorResponse struct {
    Error   string `json:"error"`
    Code    int    `json:"code"`
    Message string `json:"message,omitempty"`
}
```

### Configuration

```go
type Config struct {
    Port            string        `env:"PORT" default:"8080"`
    Environment     string        `env:"ENVIRONMENT" default:"development"`
    RedisURL        string        `env:"REDIS_URL"`
    CacheTTL        time.Duration `env:"CACHE_TTL" default:"5m"`
    RateLimitPerMin int           `env:"RATE_LIMIT" default:"100"`
    AllowedOrigins  []string      `env:"ALLOWED_ORIGINS"`
    FrankfurterURL  string        `env:"FRANKFURTER_URL" default:"https://api.frankfurter.app"`
}
```

### Dependencies

```
github.com/go-chi/chi/v5      # HTTP router
github.com/go-chi/cors        # CORS middleware
github.com/redis/go-redis/v9  # Redis client
github.com/caarlos0/env/v9    # Environment config
github.com/rs/zerolog         # Structured logging
golang.org/x/time/rate        # Rate limiting
```

---

## Frontend Architecture (React + TypeScript)

### Directory Structure

```
frontend/
├── public/
│   ├── icons/                   # PWA icons
│   └── manifest.json            # PWA manifest
├── src/
│   ├── api/
│   │   ├── client.ts            # API client configuration
│   │   ├── rates.ts             # Rates API functions
│   │   ├── convert.ts           # Convert API functions
│   │   └── currencies.ts        # Currencies API functions
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/
│   │   │   ├── Container.tsx
│   │   │   └── Grid.tsx
│   │   └── features/
│   │       ├── Converter/
│   │       │   ├── Converter.tsx
│   │       │   ├── AmountInput.tsx
│   │       │   ├── CurrencySelect.tsx
│   │       │   ├── SwapButton.tsx
│   │       │   └── ResultDisplay.tsx
│   │       ├── RatesGrid/
│   │       │   ├── RatesGrid.tsx
│   │       │   └── RateCard.tsx
│   │       ├── QuickConvert/
│   │       │   ├── QuickConvert.tsx
│   │       │   └── QuickConvertCard.tsx
│   │       └── Historical/
│   │           ├── Historical.tsx
│   │           └── HistoricalCard.tsx
│   ├── hooks/
│   │   ├── useRates.ts          # Rates query hook
│   │   ├── useConvert.ts        # Conversion hook
│   │   ├── useCurrencies.ts     # Currencies hook
│   │   ├── useHistorical.ts     # Historical data hook
│   │   └── useDebounce.ts       # Debounce utility hook
│   ├── types/
│   │   ├── currency.ts          # Currency types
│   │   ├── api.ts               # API response types
│   │   └── index.ts             # Type exports
│   ├── utils/
│   │   ├── format.ts            # Number/date formatting
│   │   ├── constants.ts         # Currency metadata
│   │   └── icons.tsx            # SVG icon components
│   ├── styles/
│   │   └── globals.css          # Global styles + Tailwind
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts            # Vite types
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── Dockerfile
└── .env.example
```

### TypeScript Types

```typescript
// src/types/currency.ts

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  priority: number;
}

export interface Rate {
  code: string;
  name: string;
  rate: number;
  change?: number;
}

export interface RatesResponse {
  base: string;
  date: string;
  rates: Rate[];
  updatedAt: string;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  updatedAt: string;
}

export interface ConversionRequest {
  from: string;
  to: string;
  amount: number;
}
```

### API Client

```typescript
// src/api/client.ts

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

export const api = {
  currencies: {
    list: () => fetchAPI<Currency[]>('/currencies'),
  },
  rates: {
    latest: (base: string) => fetchAPI<RatesResponse>(`/rates/${base}`),
    historical: (date: string, base: string) =>
      fetchAPI<RatesResponse>(`/historical/${date}?base=${base}`),
  },
  convert: (params: ConversionRequest) =>
    fetchAPI<ConversionResult>(
      `/convert?from=${params.from}&to=${params.to}&amount=${params.amount}`
    ),
};
```

### React Query Hooks

```typescript
// src/hooks/useRates.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useRates(base: string) {
  return useQuery({
    queryKey: ['rates', base],
    queryFn: () => api.rates.latest(base),
    staleTime: 5 * 60 * 1000,      // 5 minutes
    refetchInterval: 60 * 1000,    // Refetch every minute
    refetchOnWindowFocus: true,
  });
}

// src/hooks/useConvert.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useDebounce } from './useDebounce';

export function useConvert(from: string, to: string, amount: number) {
  const debouncedAmount = useDebounce(amount, 300);

  return useQuery({
    queryKey: ['convert', from, to, debouncedAmount],
    queryFn: () => api.convert({ from, to, amount: debouncedAmount }),
    enabled: debouncedAmount > 0 && from !== to,
    staleTime: 30 * 1000,  // 30 seconds
  });
}
```

### Component Example

```typescript
// src/components/features/Converter/Converter.tsx

import { useState } from 'react';
import { useConvert } from '../../../hooks/useConvert';
import { useCurrencies } from '../../../hooks/useCurrencies';
import { AmountInput } from './AmountInput';
import { CurrencySelect } from './CurrencySelect';
import { SwapButton } from './SwapButton';
import { ResultDisplay } from './ResultDisplay';

export function Converter() {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');

  const { data: currencies } = useCurrencies();
  const { data: result, isLoading, error } = useConvert(
    fromCurrency,
    toCurrency,
    amount
  );

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="converter-card">
      <AmountInput value={amount} onChange={setAmount} />

      <div className="currency-selectors">
        <CurrencySelect
          value={fromCurrency}
          onChange={setFromCurrency}
          currencies={currencies}
          label="From"
        />

        <SwapButton onClick={handleSwap} />

        <CurrencySelect
          value={toCurrency}
          onChange={setToCurrency}
          currencies={currencies}
          label="To"
        />
      </div>

      <ResultDisplay
        result={result}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
```

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0"
  }
}
```

---

## Deployment

### Backend (Fly.io)

**fly.toml:**
```toml
app = "currency-converter-api"
primary_region = "ams"

[build]
  dockerfile = "backend/Dockerfile"

[env]
  PORT = "8080"
  ENVIRONMENT = "production"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

**Backend Dockerfile:**
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN CGO_ENABLED=0 GOOS=linux go build -o /api ./cmd/api

FROM alpine:3.19
RUN apk --no-cache add ca-certificates
COPY --from=builder /api /api
EXPOSE 8080
CMD ["/api"]
```

### Frontend (Vercel)

**vercel.json:**
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://currency-converter-api.fly.dev/api/:path*" }
  ]
}
```

### Environment Variables

**Backend (.env):**
```
PORT=8080
ENVIRONMENT=development
REDIS_URL=redis://localhost:6379
CACHE_TTL=5m
RATE_LIMIT=100
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app
FRANKFURTER_URL=https://api.frankfurter.app
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:8080/api/v1
```

---

## Development Workflow

### Local Development

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - REDIS_URL=redis://redis:6379
      - ALLOWED_ORIGINS=http://localhost:5173
    depends_on:
      - redis

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8080/api/v1
    volumes:
      - ./frontend/src:/app/src

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Makefile Commands

```makefile
.PHONY: dev dev-backend dev-frontend build test lint

# Development
dev:
	docker-compose up

dev-backend:
	cd backend && go run ./cmd/api

dev-frontend:
	cd frontend && npm run dev

# Build
build:
	docker-compose build

build-backend:
	cd backend && go build -o bin/api ./cmd/api

build-frontend:
	cd frontend && npm run build

# Test
test:
	cd backend && go test ./...
	cd frontend && npm test

# Lint
lint:
	cd backend && golangci-lint run
	cd frontend && npm run lint

# Deploy
deploy-backend:
	fly deploy --config fly.toml

deploy-frontend:
	vercel --prod
```

---

## Implementation Phases

### Phase 1: Backend Foundation
- [ ] Initialize Go module and project structure
- [ ] Implement configuration loading
- [ ] Set up HTTP router with Chi
- [ ] Create Frankfurter API client
- [ ] Implement in-memory cache
- [ ] Create handlers for all endpoints
- [ ] Add middleware (CORS, logging, rate limiting)
- [ ] Write unit tests
- [ ] Create Dockerfile

### Phase 2: Frontend Foundation
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Set up TanStack Query
- [ ] Create API client with types
- [ ] Implement custom hooks
- [ ] Build UI components library

### Phase 3: Feature Implementation
- [ ] Converter component with real-time conversion
- [ ] Rates grid with auto-refresh
- [ ] Quick convert cards
- [ ] Historical data section
- [ ] Currency search/select component
- [ ] Loading states and error handling

### Phase 4: Polish & PWA
- [ ] Responsive design refinement
- [ ] PWA configuration (manifest, service worker)
- [ ] Offline support
- [ ] Performance optimization
- [ ] Accessibility improvements

### Phase 5: Deployment
- [ ] Set up Fly.io for backend
- [ ] Configure Redis on Fly.io
- [ ] Set up Vercel for frontend
- [ ] Configure environment variables
- [ ] Set up CI/CD with GitHub Actions

---

## Future Enhancements

- **User Accounts:** Save favorite pairs, preferences
- **Rate Alerts:** Email/push notifications when rate hits target
- **Charts:** Interactive historical rate charts with Chart.js/Recharts
- **Multiple APIs:** Fallback to alternative rate providers
- **Offline Mode:** Full offline functionality with cached rates
- **Mobile App:** React Native version using shared types

---

## Resources

- [Frankfurter API Documentation](https://www.frankfurter.app/docs/)
- [Go Chi Router](https://go-chi.io/)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/)
- [Fly.io Documentation](https://fly.io/docs/)
- [Vercel Documentation](https://vercel.com/docs)
