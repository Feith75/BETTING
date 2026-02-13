# Subscription Gaming Platform - Task List

## Phase 1: Database & Backend Updates
- [x] **Update Database Schema**
    - [x] Rename `balance` to `coins` in users table
    - [x] Add `subscription_tier`, `subscription_expires` to users
    - [x] Create `subscriptions` table
    - [x] Create `prizes` table
    - [x] Create `prize_winners` table
    - [x] Create `leaderboard_stats` table
- [x] **Subscription System**
    - [x] Create subscription model & controller
    - [x] Implement tier management (Basic, Premium, VIP)
    - [x] Add coin allocation logic
    - [x] Create subscription API endpoints
- [x] **Prize Management**
    - [x] Create prize catalog system
    - [ ] Implement winner selection algorithm
    - [ ] Add prize claiming workflow
    - [x] Build leaderboard tracker

## Phase 2: Live Gifting Economy (Pivot)
- [x] **Database Updates**
    - [x] Add `diamonds` column to users (for cashing out)
    - [x] Create `gifts` table (id, name, cost, icon)
    - [x] Create `gift_transactions` table
- [x] **Backend: Gifting System**
    - [x] Create `giftController.js` (Handle sending/receiving)
    - [x] Remove `oddsEngine.js` (Betting no longer needed)
    - [x] Update `liveMatchEngine.js` to broadcast gift events
- [x] **Frontend: Viewer UI**
    - [x] Remove Betting Panel from `live.html`
    - [x] Add "Send Gift" Panel (Grid of icons: 🌹, ⚽, 🏆)
    - [x] Add "Gift Stream" visualizer (Chat/Ticker style)

## Phase 3: Creator Monetization
- [x] **Wallet & Earnings**
    - [x] Display 'Diamonds' (Earnings) vs 'Coins' (Spending)
    - [x] Implement "Cash Out" request flow (Simulated)
- [x] **Subscription Access**
    - [x] Integrate M-Pesa STK Push (Simulated)
    - [x] Gate specific matches/games behind "Premium Access"

## Phase 4: Legal & Compliance
- [x] **Terms & Conditions**
    - [x] Update to skill-gaming model
    - [x] Add "no cash value" disclaimers
- [x] **Gift Policies**
    - [x] Add "Platform Controls Withdrawals" clause
    - [x] Add "No Gambling" strict policy

## Phase 5: Testing
- [ ] Test Gifting Flow (Viewer -> Player)
- [ ] Verify Diamond conversion
- [ ] Test Access Control
