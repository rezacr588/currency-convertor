# Currency Converter v2 - Architecture Plan

## Overview

A modern, full-stack currency converter application with real-time exchange rates, historical data, and a responsive PWA interface.

**Tech Stack:**
- **Backend:** Go (Golang)
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Cache:** In-memory (go-cache)
- **Deployment:** Koyeb (full-stack - single service)

**Live URL (after deployment):**
- **Application:** `https://currency-converter-<username>.koyeb.app`

> **Architecture:** The Go backend serves both the API and the static frontend files, allowing us to deploy everything as a single Koyeb service within the free tier.

---

## Repository Structure

```
currency-converter-v2/
├── frontend/                    # React + TypeScript application
├── backend/                     # Go API server (also serves frontend)
├── docker-compose.yml           # Local development
├── Dockerfile                   # Production build (full-stack)
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
│   │   ├── historical.go        # GET /api/v1/historical/:date
│   │   └── static.go            # Serve frontend static files
│   ├── middleware/
│   │   ├── cors.go              # CORS middleware
│   │   ├── logging.go           # Request logging
│   │   └── ratelimit.go         # Rate limiting
│   ├── model/
│   │   ├── currency.go          # Currency domain model
│   │   ├── rate.go              # Rate domain model
│   │   └── conversion.go        # Conversion result model
│   ├── repository/
│   │   ├── cache.go             # Cache interface + in-memory implementation
│   │   └── frankfurter.go       # Frankfurter API client
│   ├── service/
│   │   └── exchange.go          # Business logic
│   └── router/
│       └── router.go            # Route definitions
├── pkg/
│   └── httputil/
│       ├── response.go          # JSON response helpers
│       └── errors.go            # Error types
├── static/                      # Built frontend files (copied during build)
├── go.mod
├── go.sum
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
| `GET` | `/*` | Serve frontend static files | HTML/JS/CSS |

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

### Serving Static Files (Frontend)

```go
// internal/handler/static.go

package handler

import (
    "embed"
    "io/fs"
    "net/http"
    "strings"
)

//go:embed static/*
var staticFiles embed.FS

func StaticHandler() http.Handler {
    // Strip "static" prefix from embedded files
    fsys, _ := fs.Sub(staticFiles, "static")
    fileServer := http.FileServer(http.FS(fsys))

    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Serve index.html for SPA routes (non-file requests)
        path := r.URL.Path
        if !strings.Contains(path, ".") {
            r.URL.Path = "/"
        }
        fileServer.ServeHTTP(w, r)
    })
}
```

### Configuration

```go
type Config struct {
    Port            string        `env:"PORT" default:"8080"`
    Environment     string        `env:"ENVIRONMENT" default:"development"`
    CacheTTL        time.Duration `env:"CACHE_TTL" default:"5m"`
    RateLimitPerMin int           `env:"RATE_LIMIT" default:"100"`
    FrankfurterURL  string        `env:"FRANKFURTER_URL" default:"https://api.frankfurter.app"`
}
```

> **Note:** We use in-memory caching (go-cache) instead of Redis to stay within Koyeb's free tier.
> CORS is not needed since frontend and backend are served from the same origin.

### Dependencies

```
github.com/go-chi/chi/v5        # HTTP router
github.com/patrickmn/go-cache   # In-memory cache
github.com/caarlos0/env/v9      # Environment config
github.com/rs/zerolog           # Structured logging
golang.org/x/time/rate          # Rate limiting
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

// Same origin - no need for full URL
const API_BASE = '/api/v1';

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

## Deployment (Koyeb - Full Stack)

### Why Single Service Deployment?

Koyeb's free tier includes only **1 web service**. By having the Go backend serve the frontend static files, we can deploy the entire application as a single service:

- ✅ Uses only 1 free web service
- ✅ No CORS issues (same origin)
- ✅ Simpler deployment
- ✅ Single URL for everything
- ✅ Better performance (no cross-origin requests)

### Dockerfile (Full-Stack Build)

**Dockerfile** (in repository root):
```dockerfile
# ============ Stage 1: Build Frontend ============
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build

# ============ Stage 2: Build Backend ============
FROM golang:1.22-alpine AS backend-builder

WORKDIR /app

# Install dependencies
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy backend source
COPY backend/ ./

# Copy built frontend into backend static folder
COPY --from=frontend-builder /app/frontend/dist ./static/

# Build the binary with embedded static files
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /api ./cmd/api

# ============ Stage 3: Final Image ============
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

COPY --from=backend-builder /api /api

EXPOSE 8080

CMD ["/api"]
```

### Deploy to Koyeb

#### Option A: Deploy via GitHub (Recommended)

1. Push your code to GitHub
2. Go to [Koyeb Console](https://app.koyeb.com)
3. Click "Create App" → "GitHub"
4. Select your repository
5. Configure:
   - **Name:** `currency-converter`
   - **Builder:** Dockerfile
   - **Dockerfile path:** `Dockerfile`
   - **Port:** 8080
   - **Region:** Frankfurt (fra) or Washington (was)
   - **Instance:** Free

#### Option B: Deploy via Koyeb CLI

```bash
# Install Koyeb CLI
curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | bash

# Login
koyeb login

# Deploy from GitHub
koyeb app create currency-converter \
  --git github.com/yourusername/currency-converter-v2 \
  --git-branch main \
  --git-builder dockerfile \
  --ports 8080:http \
  --routes /:8080 \
  --regions fra \
  --instance-type free
```

### Environment Variables

In Koyeb Console → Your App → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `8080` | Server port |
| `ENVIRONMENT` | `production` | Environment mode |
| `CACHE_TTL` | `5m` | Cache duration |
| `RATE_LIMIT` | `100` | Requests per minute |
| `FRANKFURTER_URL` | `https://api.frankfurter.app` | Exchange rate API |

### Verify Deployment

Your application will be available at:
```
https://currency-converter-<your-username>.koyeb.app
```

Test endpoints:
```bash
# Frontend (should return HTML)
curl https://currency-converter-xxx.koyeb.app/

# Health check
curl https://currency-converter-xxx.koyeb.app/health

# API - Get rates
curl https://currency-converter-xxx.koyeb.app/api/v1/rates/USD

# API - Convert currency
curl "https://currency-converter-xxx.koyeb.app/api/v1/convert?from=USD&to=EUR&amount=100"
```

---

### Custom Domain Setup (Optional)

1. Go to Koyeb Console → Your App → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `converter.yourdomain.com`)
4. Add CNAME record at your DNS provider:
   ```
   converter.yourdomain.com → <app-name>.koyeb.app
   ```
5. Koyeb will automatically provision SSL certificate

---

### CI/CD with GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Koyeb

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Test Backend
      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Run backend tests
        working-directory: ./backend
        run: go test ./...

      # Test Frontend
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run frontend tests
        working-directory: ./frontend
        run: npm test --if-present

      - name: Build frontend
        working-directory: ./frontend
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Koyeb CLI
        run: curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | bash

      - name: Deploy to Koyeb
        env:
          KOYEB_TOKEN: ${{ secrets.KOYEB_TOKEN }}
        run: |
          koyeb service redeploy currency-converter/currency-converter
```

**Required Secrets:**
- `KOYEB_TOKEN`: Get from Koyeb Console → Account → API Tokens

---

## Development Workflow

### Local Development

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - ENVIRONMENT=development
      - CACHE_TTL=5m
      - FRANKFURTER_URL=https://api.frankfurter.app
    volumes:
      - ./backend:/app
    command: go run ./cmd/api

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public
    command: npm run dev -- --host
```

**backend/Dockerfile.dev:**
```dockerfile
FROM golang:1.22-alpine
WORKDIR /app
RUN go install github.com/air-verse/air@latest
COPY go.mod go.sum ./
RUN go mod download
COPY . .
CMD ["air", "-c", ".air.toml"]
```

**frontend/Dockerfile.dev:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

**Vite Proxy Configuration (frontend/vite.config.ts):**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

### Makefile Commands

```makefile
.PHONY: dev dev-backend dev-frontend build test lint deploy

# Development
dev:
	docker-compose up

dev-backend:
	cd backend && go run ./cmd/api

dev-frontend:
	cd frontend && npm run dev

# Build
build:
	docker build -t currency-converter .

build-backend:
	cd backend && go build -o bin/api ./cmd/api

build-frontend:
	cd frontend && npm run build

# Test
test:
	cd backend && go test ./...
	cd frontend && npm test --if-present

# Lint
lint:
	cd backend && golangci-lint run
	cd frontend && npm run lint

# Deploy
deploy:
	koyeb service redeploy currency-converter/currency-converter

# Koyeb commands
logs:
	koyeb service logs currency-converter/currency-converter

status:
	koyeb service describe currency-converter/currency-converter

# Local production test
run-local:
	docker build -t currency-converter . && \
	docker run -p 8080:8080 -e PORT=8080 -e ENVIRONMENT=production currency-converter
```

---

## Implementation Phases

### Phase 1: Backend Foundation
- [ ] Initialize Go module and project structure
- [ ] Implement configuration loading
- [ ] Set up HTTP router with Chi
- [ ] Create Frankfurter API client
- [ ] Implement in-memory cache
- [ ] Create handlers for all API endpoints
- [ ] Add static file serving handler
- [ ] Add middleware (logging, rate limiting)
- [ ] Write unit tests
- [ ] Create development Dockerfile

### Phase 2: Frontend Foundation
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Set up TanStack Query
- [ ] Create API client with types
- [ ] Implement custom hooks
- [ ] Build UI components library
- [ ] Configure Vite proxy for development

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
- [ ] Create production Dockerfile (multi-stage)
- [ ] Create Koyeb account (no credit card needed)
- [ ] Deploy full-stack app to Koyeb
- [ ] Configure environment variables
- [ ] Set up CI/CD with GitHub Actions
- [ ] Configure custom domain (optional)

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

### API & Backend
- [Frankfurter API Documentation](https://www.frankfurter.app/docs/)
- [Go Chi Router](https://go-chi.io/)
- [Go-cache (In-memory caching)](https://github.com/patrickmn/go-cache)
- [Go Embed Static Files](https://pkg.go.dev/embed)

### Frontend
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

### Deployment
- [Koyeb Documentation](https://www.koyeb.com/docs)
- [Koyeb CLI Reference](https://www.koyeb.com/docs/cli)
- [Koyeb Go Deployment Guide](https://www.koyeb.com/docs/deploy/go)
- [Koyeb Docker Deployment](https://www.koyeb.com/docs/deploy/docker)

### Free Tier Limits (Koyeb)
- **Web Service:** 1 free (512MB RAM, 0.1 vCPU, 2GB SSD)
- **Database:** 1 free PostgreSQL (1GB RAM, 50 active hours)
- **Regions:** Frankfurt or Washington DC
- **Domains:** 5 custom domains with free SSL
- **Scale-to-zero:** Enforced on free tier
