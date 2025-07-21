# Sweet Dreams - Sleep Training Timer

A progressive web app designed to help parents with sleep training using timed check intervals.

## Features

- **Customizable Training Days**: Configure check intervals for each training day
- **Persistent Mobile Notifications**: Live countdown timer in notification bar
- **Session Logging**: Automatic tracking of crying episodes and check times
- **History Tracking**: View past sleep training sessions
- **Mobile-First Design**: Optimized for smartphone use during nighttime
- **Persistent State**: Resumes timers if app is closed and reopened
- **Framework7 UI**: Native-like iOS interface components
- **Service Worker**: Background notifications with action buttons

## Quick Start

1. Open the app
2. Select your current training day (1-5)
3. When baby starts crying, tap "Crying"
4. Wait for the recommended time (timer turns orange when ready)
5. Tap "Check" to go comfort the baby
6. Continue until baby falls asleep, then tap "Baby Sleeping"

## Training Schedule

- **Day 1**: 2, 2, 3, 3 minute intervals
- **Day 2**: 2, 3, 3, 4 minute intervals  
- **Day 3**: 3, 4, 4, 5 minute intervals
- **Day 4**: 3, 4, 5, 5 minute intervals
- **Day 5**: 4, 5, 6, 6 minute intervals

## Project Structure

```
├── README.md
├── package.json
├── webpack.config.js
├── dist/                 # Production build output
└── src/                 # Source files
    ├── index.html       # Development HTML
    ├── index-template.html # Production HTML template
    ├── sw.js           # Service Worker
    ├── css/
    │   └── app.css
    ├── js/
    │   ├── app.js      # Main application logic
    │   └── history.js  # History page functionality
    ├── pages/          # Framework7 pages
    │   ├── history.html
    │   ├── info.html
    │   └── settings.html
    └── icons/
        └── icon.svg
```

## Development

```bash
npm install
npm start          # Development server (serves from src/)
npm run build      # Production build
npm run serve:dist # Serve production build locally
```

## Deployment

The app is configured for GitHub Pages deployment:

```bash
npm run deploy
```