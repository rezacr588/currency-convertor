# Real-Time Currency Converter

A modern, responsive currency converter application that provides real-time exchange rates using the Frankfurter API. Built with vanilla HTML, CSS, and JavaScript - no server required!

## Features

- **Real-Time Conversion**: Convert between 30+ currencies with live exchange rates
- **Live Rates Dashboard**: View current exchange rates for major currencies at a glance
- **Quick Conversions**: Pre-configured currency pairs for instant conversions
- **Historical Comparison**: See how rates have changed over the past week and month
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Auto-Refresh**: Rates automatically update every 5 minutes
- **No API Key Required**: Uses the free Frankfurter API

## Supported Currencies

USD, EUR, GBP, TRY (Turkish Lira), JPY, CHF, AUD, CAD, CNY, INR, MXN, SGD, HKD, NOK, SEK, DKK, NZD, ZAR, BRL, KRW, PLN, THB, IDR, HUF, CZK, ILS, PHP, MYR, RON, BGN, ISK, and more!

## Demo

Visit the live demo: [Currency Converter](https://YOUR_USERNAME.github.io/currency-convertor/)

## Deployment on GitHub Pages

### Option 1: Automatic Deployment (Recommended)

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Pages**
3. Under "Source", select **Deploy from a branch**
4. Select the `main` branch (or `claude/currency-converter-app-uJfxb` if that's your branch)
5. Select the `/ (root)` folder
6. Click **Save**
7. Wait a few minutes for the deployment to complete
8. Your site will be available at `https://YOUR_USERNAME.github.io/currency-convertor/`

### Option 2: Manual Deployment

1. Clone the repository
2. Open `index.html` in your browser for local testing
3. Push to GitHub and enable Pages as described above

## Project Structure

```
currency-convertor/
├── index.html      # Main HTML file
├── styles.css      # CSS styles
├── app.js          # JavaScript application logic
└── README.md       # This file
```

## API

This project uses the [Frankfurter API](https://www.frankfurter.app/), a free, open-source API for current and historical foreign exchange rates published by the European Central Bank.

### API Endpoints Used:

- `GET /currencies` - List all available currencies
- `GET /latest?from={base}` - Get latest rates
- `GET /latest?from={from}&to={to}&amount={amount}` - Convert specific amount
- `GET /{date}?from={from}&to={to}` - Get historical rates

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Exchange rate data provided by [Frankfurter API](https://www.frankfurter.app/)
- Font: [Inter](https://fonts.google.com/specimen/Inter) by Google Fonts
