# Currency Converter v2 - Architecture Plan

## Overview

A modern, full-stack currency converter application with real-time exchange rates, historical data, and a responsive PWA interface.

**Tech Stack:**
- **Backend:** Go (Golang)
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Cache:** In-memory (go-cache)
- **Deployment:** Koyeb (backend) + Vercel (frontend)

**Live URLs (after deployment):**
- **Backend API:** `https://currency-api-<username>.koyeb.app`
- **Frontend:** `https://currency-converter.vercel.app`

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
    CacheTTL        time.Duration `env:"CACHE_TTL" default:"5m"`
    RateLimitPerMin int           `env:"RATE_LIMIT" default:"100"`
    AllowedOrigins  []string      `env:"ALLOWED_ORIGINS"`
    FrankfurterURL  string        `env:"FRANKFURTER_URL" default:"https://api.frankfurter.app"`
}
```

> **Note:** We use in-memory caching (go-cache) instead of Redis to stay within Koyeb's free tier.
> This is sufficient for a single-instance deployment. For multi-instance scaling, consider upgrading to use Koyeb's PostgreSQL or external Redis.

### Dependencies

```
github.com/go-chi/chi/v5        # HTTP router
github.com/go-chi/cors          # CORS middleware
github.com/patrickmn/go-cache   # In-memory cache (no Redis needed for free tier)
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

### Backend (Koyeb) - FREE TIER

Koyeb provides a free tier with:
- 1 Web Service (512MB RAM, 0.1 vCPU)
- 1 PostgreSQL Database (optional)
- Free subdomain: `*.koyeb.app`
- Auto SSL certificates
- No credit card required

#### Step 1: Create Dockerfile

**backend/Dockerfile:**
```dockerfile
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /api ./cmd/api

# Final stage
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /api /api

EXPOSE 8080

CMD ["/api"]
```

#### Step 2: Deploy to Koyeb

**Option A: Deploy via GitHub (Recommended)**

1. Push your code to GitHub
2. Go to [Koyeb Console](https://app.koyeb.com)
3. Click "Create App" → "GitHub"
4. Select your repository
5. Configure:
   - **Builder:** Dockerfile
   - **Dockerfile path:** `backend/Dockerfile`
   - **Port:** 8080
   - **Region:** Frankfurt (fra) or Washington (was)
   - **Instance:** Free

**Option B: Deploy via Koyeb CLI**

```bash
# Install Koyeb CLI
curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | bash

# Login
koyeb login

# Deploy from GitHub
koyeb app create currency-api \
  --git github.com/yourusername/currency-converter-v2 \
  --git-branch main \
  --git-workdir backend \
  --git-builder dockerfile \
  --ports 8080:http \
  --routes /:8080 \
  --regions fra \
  --instance-type free

# Or deploy from Docker image
koyeb app create currency-api \
  --docker yourusername/currency-api:latest \
  --ports 8080:http \
  --routes /:8080 \
  --regions fra \
  --instance-type free
```

#### Step 3: Configure Environment Variables

In Koyeb Console → Your App → Settings → Environment Variables:

```
PORT=8080
ENVIRONMENT=production
CACHE_TTL=5m
RATE_LIMIT=100
ALLOWED_ORIGINS=https://currency-converter.vercel.app,https://your-domain.com
FRANKFURTER_URL=https://api.frankfurter.app
```

#### Step 4: Verify Deployment

Your API will be available at:
```
https://currency-api-<your-username>.koyeb.app
```

Test endpoints:
```bash
# Health check
curl https://currency-api-xxx.koyeb.app/health

# Get rates
curl https://currency-api-xxx.koyeb.app/api/v1/rates/USD

# Convert currency
curl "https://currency-api-xxx.koyeb.app/api/v1/convert?from=USD&to=EUR&amount=100"
```

---

### Frontend (Vercel) - FREE TIER

Vercel provides:
- Unlimited static deployments
- Free subdomain: `*.vercel.app`
- Auto SSL certificates
- GitHub integration

#### Step 1: Configure Vercel

**frontend/vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://currency-api-<username>.koyeb.app/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

#### Step 2: Deploy to Vercel

**Option A: Deploy via GitHub (Recommended)**

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Import your repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

**Option B: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

#### Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
VITE_API_URL=https://currency-api-<username>.koyeb.app/api/v1
```

---

### Environment Variables Summary

**Backend (Koyeb):**
| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `8080` | Server port |
| `ENVIRONMENT` | `production` | Environment mode |
| `CACHE_TTL` | `5m` | Cache duration |
| `RATE_LIMIT` | `100` | Requests per minute |
| `ALLOWED_ORIGINS` | `https://...` | CORS origins |
| `FRANKFURTER_URL` | `https://api.frankfurter.app` | Exchange rate API |

**Frontend (Vercel):**
| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://currency-api-xxx.koyeb.app/api/v1` | Backend API URL |

---

### Custom Domain Setup (Optional)

**Koyeb (Backend):**
1. Go to App → Settings → Domains
2. Add your domain (e.g., `api.yourdomain.com`)
3. Add CNAME record: `api.yourdomain.com` → `<app-name>.koyeb.app`

**Vercel (Frontend):**
1. Go to Project → Settings → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add A record or CNAME as instructed

---

### CI/CD with GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Run tests
        working-directory: ./backend
        run: go test ./...

      - name: Install Koyeb CLI
        run: curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | bash

      - name: Deploy to Koyeb
        env:
          KOYEB_TOKEN: ${{ secrets.KOYEB_TOKEN }}
        run: |
          koyeb service redeploy currency-api/currency-api

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
          vercel-args: '--prod'
```

**Required Secrets:**
- `KOYEB_TOKEN`: Get from Koyeb Console → Account → API
- `VERCEL_TOKEN`: Get from Vercel → Settings → Tokens
- `VERCEL_ORG_ID`: Get from `.vercel/project.json`
- `VERCEL_PROJECT_ID`: Get from `.vercel/project.json`
- `VITE_API_URL`: Your Koyeb backend URL

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
      - PORT=8080
      - ENVIRONMENT=development
      - CACHE_TTL=5m
      - ALLOWED_ORIGINS=http://localhost:5173
      - FRANKFURTER_URL=https://api.frankfurter.app

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile.dev
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8080/api/v1
    volumes:
      - ./frontend/src:/app/src
    command: npm run dev -- --host
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
	koyeb service redeploy currency-api/currency-api

deploy-frontend:
	cd frontend && vercel --prod

# Koyeb specific
koyeb-logs:
	koyeb service logs currency-api/currency-api

koyeb-status:
	koyeb service describe currency-api/currency-api
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
- [ ] Create Koyeb account (no credit card needed)
- [ ] Deploy Go backend to Koyeb
- [ ] Set up Vercel for frontend
- [ ] Configure environment variables on both platforms
- [ ] Set up CI/CD with GitHub Actions
- [ ] Configure custom domains (optional)

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

### Frontend
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

### Deployment
- [Koyeb Documentation](https://www.koyeb.com/docs)
- [Koyeb CLI Reference](https://www.koyeb.com/docs/cli)
- [Koyeb Go Deployment Guide](https://www.koyeb.com/docs/deploy/go)
- [Vercel Documentation](https://vercel.com/docs)

### Free Tier Limits (Koyeb)
- **Web Service:** 1 free (512MB RAM, 0.1 vCPU, 2GB SSD)
- **Database:** 1 free PostgreSQL (1GB RAM, 50 active hours)
- **Regions:** Frankfurt or Washington DC
- **Domains:** 5 custom domains with free SSL
- **Scale-to-zero:** Enforced on free tier
