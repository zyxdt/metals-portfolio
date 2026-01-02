# Metals Portfolio Tracker - TODO

## Public Pages
- [x] Landing page with value proposition and CTA
- [x] Live prices page for gold, silver, platinum, palladium
- [x] Prices shown per gram and ounce
- [x] Basic price charts (1D, 1W, 1M, 1Y)

## User Authentication
- [x] Email + password authentication (via Manus OAuth)
- [x] User settings page

## Portfolio System
- [x] Add metals with type, weight (grams/kg), optional buy price
- [x] Store weights internally in grams
- [x] Portfolio value updates automatically using live prices
- [x] Edit and delete portfolio holdings

## Dashboard
- [x] Total portfolio value display
- [x] Metal allocation breakdown (%)
- [x] Individual metal values
- [x] Portfolio value chart (pie chart for allocation)

## Metal Detail Pages
- [x] Total weight owned per metal
- [x] Current value display
- [x] Price history chart
- [x] Contribution to portfolio percentage

## User Settings
- [x] Currency preference (USD, EUR, GBP, etc.)
- [x] Unit selection (grams/ounces)

## Backend Infrastructure
- [x] Database schema for users, portfolios, holdings, price cache
- [x] Metals price API integration (Yahoo Finance)
- [x] Price caching system (5-minute refresh)
- [x] tRPC procedures for all features

## Design & Polish
- [x] Elegant dark theme with gold accents
- [x] Responsive mobile-first design
- [x] Loading states and error handling
- [x] Smooth animations and transitions

## Future Enhancements (Not in MVP)
- [ ] Optional portfolio summary emails (daily/weekly/monthly)
- [ ] Price alerts based on user-defined thresholds
- [ ] Multiple portfolios per user
- [ ] CSV export
- [ ] Advanced charts
