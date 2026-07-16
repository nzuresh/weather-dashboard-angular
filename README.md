# Weather Dashboard

A web-based weather dashboard application built with AngularJS 1.4.7 that displays current weather conditions and 5-day forecasts for multiple cities using the OpenWeatherMap API.

## ✅ Status: Production Ready

All tests passing — Unit tests (29/29) | E2E tests (12/12) | WCAG AA compliant

## Features

- 🔍 Search for cities and view current weather
- 📅 5-day weather forecast with detailed information
- ⭐ Save favorite cities for quick access
- 🌡️ Toggle between Celsius and Fahrenheit
- 🌙 Dark mode / Light mode toggle with persistence
- 🕐 Search history with autocomplete suggestions
- 🔄 Refresh weather data with smart caching
- 📱 Fully responsive design (mobile, tablet, desktop)
- 💾 Local storage for favorites, preferences, and history
- ♿ Accessible (WCAG AA compliant)
- 🎨 Weather-appropriate theming
- ⚡ Performance optimized with caching and throttling

## Quick Start

### 1. Get OpenWeatherMap API Key (Required)

1. Sign up for a free account at [OpenWeatherMap](https://openweathermap.org/api)
2. Navigate to your API keys section
3. Copy your API key (free tier supports 60 calls/minute)

### 2. Configure API Key

Copy the config template and add your API key:

```bash
cp app/config.example.js app/config.js
```

Then edit `app/config.js` and replace the placeholder with your actual API key:

```javascript
var WEATHER_CONFIG = {
    API_KEY: 'your_actual_api_key_here'
};
```

> **Note:** `app/config.js` is gitignored and will not be committed to the repository.

### 3. Run the Application

```bash
npm start
```

Or use any static file server. The application will be available at `http://localhost:8000`

### 4. Install Dependencies (for testing)

```bash
npm install
```

## Project Structure

```
weather-dashboard/
├── app/
│   ├── controllers/
│   │   └── weatherController.js
│   ├── services/
│   │   ├── validationService.js
│   │   ├── storageService.js
│   │   ├── weatherService.js
│   │   ├── themeService.js
│   │   └── searchHistoryService.js
│   ├── directives/
│   │   ├── currentWeather.js
│   │   ├── weatherForecast.js
│   │   ├── cityList.js
│   │   ├── themeToggle.js
│   │   ├── searchHistory.js
│   │   ├── errorMessage.js
│   │   └── loadingIndicator.js
│   ├── config.example.js    ← Template (committed)
│   ├── config.js            ← Your local config (gitignored)
│   └── app.js
├── e2e/
│   └── weather-dashboard.spec.js
├── test/
│   ├── controllers/
│   ├── services/
│   └── directives/
├── styles/
│   └── main.css
├── index.html
├── karma.conf.js
├── playwright.config.js
└── package.json
```

## Testing

### Unit Tests (Karma + Jasmine)

```bash
npm test
```

29 tests covering services, controllers, and directives.

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

12 tests validating:

| Test | Description |
|------|-------------|
| AC1 | Application loads and renders without errors |
| AC2 | Search input accepts city names |
| AC3 | Search button is present and clickable |
| AC4 | Temperature unit toggle works |
| AC5 | Dark mode toggle renders and switches theme |
| AC6 | Empty state message shown when no weather data |
| AC7 | Favorites section is visible |
| AC8 | Skip to main content link exists |
| AC9 | Search input has proper aria labels |
| AC10 | Theme toggle has aria-label |
| AC11 | Renders correctly at desktop viewport |
| AC12 | Renders correctly at mobile viewport |

To run tests with a visible browser:

```bash
npm run test:e2e:headed
```

To use the Playwright UI mode:

```bash
npm run test:e2e:ui
```

## Technologies

- AngularJS 1.4.7
- OpenWeatherMap API (Free tier)
- HTML5 Local Storage
- CSS3 with Flexbox and Grid
- Jasmine + Karma for unit testing
- Playwright for E2E testing

## Browser Support

- Chrome 40+
- Firefox 35+
- Safari 8+
- Edge 12+

## Security Notes

- API keys are stored in `app/config.js` which is gitignored — never committed to source control
- Copy `app/config.example.js` to `app/config.js` and add your own key
- The OpenWeatherMap free tier key has built-in rate limiting (60 calls/min)

## License

MIT
