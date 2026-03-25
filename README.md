# MarshallControls

A React Native mobile application for controlling Active Noise Cancellation (ANC) on Marshall Motif A.N.C. headphones via Bluetooth Low Energy.

## Overview

MarshallControls gives you direct control over your Marshall Motif A.N.C. headphones from your phone. Switch between noise cancellation modes instantly, stay in sync when you press the physical button on the headphones, and rely on automatic reconnection when the connection drops.

## Features

- **ANC Mode Control** — switch between Noise Cancelling, Transparency, and Off
- **Real-time Sync** — UI reflects physical button presses on the headphones instantly
- **Auto-reconnect** — recovers the connection automatically after drops, up to 5 attempts
- **Connection Status** — clear feedback at every step of the connection process

## Requirements

- iOS or Android device with Bluetooth
- Marshall Motif A.N.C. headphones
- Node.js >= 22.11.0

## Getting Started

Install dependencies:

```sh
pnpm install
```

Install iOS pods:

```sh
cd ios && bundle exec pod install
```

Start Metro:

```sh
pnpm start
```

Run on device:

```sh
# iOS
pnpm ios

# Android
pnpm android
```

> Make sure Bluetooth is enabled and the headphones are powered on before connecting.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.84 | Cross-platform mobile framework |
| React | 19 | UI and state management |
| TypeScript | 5.8 | Type safety across the codebase |
| react-native-ble-plx | 3.5 | Bluetooth Low Energy communication |
| react-native-safe-area-context | 5.5 | Safe area inset handling |
| base-64 | 1.0 | BLE characteristic data encoding |
| Metro | — | JavaScript bundler |
| pnpm | 10 | Package manager |

## Project Structure

```
app/
├── bluetooth/
│   ├── BleManager.ts           # Singleton BLE manager
│   ├── DeviceScanner.ts        # Scanning, permissions, connection
│   ├── MarshallProtocol.ts     # UUIDs, command bytes, mode mappings
│   └── hooks/
│       ├── useDeviceConnection.ts  # Connection lifecycle & reconnection
│       └── useANCControl.ts        # ANC mode read/write/monitor
├── screens/
│   ├── ConnectScreen.tsx       # Connection UI
│   └── HeadphonesScreen.tsx    # ANC control UI
└── types.ts                    # Shared types
```

## Architecture

The app uses a custom hooks pattern for Bluetooth state management — no external state library. `useDeviceConnection` owns the full connection lifecycle including automatic reconnection, while `useANCControl` handles reading and writing the ANC characteristic. The root `App` component conditionally renders either the connect or control screen based on connection state.
