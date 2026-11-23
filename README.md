# Smart MTC Bus Arrival & Category Display System (Chennai, Tamil Nadu)

A modern, production-grade passenger information TV display and terminal operations system prototype for the **Metropolitan Transport Corporation (MTC)** in Chennai, Tamil Nadu, India.

Designed for installation on large 16:9 television screens, LED monitors, and digital signage kiosks at major MTC bus stands and intermodal transit hubs (such as CMBT Koyambedu, Broadway, Guindy, Tambaram, T. Nagar, Adyar, Anna Nagar, and Velachery).

---

## 1. What the Project Does

The system provides clear, high-contrast, distance-readable arrival information to help all passengers—including daily commuters, tourists, elderly individuals, and children—instantly answer four key questions:
1. **Which bus is coming next?** (Bus number e.g., `70A`, `21G`, `570`, `102`)
2. **Where does it go?** (Starting origin and final destination in Tamil and English)
3. **What category of bus is it?** (Ordinary 🚌, Express 💨, Deluxe ⭐, AC Electric ❄️, Night Special 🌙)
4. **How long to wait?** (High-impact countdown: `3 MIN`, `🟢 ARRIVING NOW`, `🔴 DELAYED`)
5. **Which platform or bay to board?** (e.g., `Bay 3`, `Platform 1`)

---

## 2. How the Prototype Works

- **Public TV Display Mode**: Press the **`🖥 ENTER TV DISPLAY MODE`** button on top to toggle a clean, high-contrast kiosk layout optimized for 10-foot viewing distances.
- **Autonomous Real-Time Simulation Engine**: Simulates live GPS telemetry countdowns. Every few seconds, bus ETAs dynamically decrement (`10 min → 9 min → ... → 0 min`).
- **Live Departure & Continuous Ingestion**: When a bus reaches `0 min` (`🟢 ARRIVING NOW`), it announces arrival, holds for boarding, departs, and smoothly introduces the next scheduled bus from the fleet pool.
- **Audio Chime System**: Built with the native Web Audio API (zero audio file dependencies) to synthesize pleasant airport/railway transit chimes on arrival and announcements.
- **Bilingual Support**: Instant toggle between English (`EN`), Tamil (`தமிழ்`), or Dual Bilingual mode (`Dual`) to render all routes, station names, categories, and safety alerts in authentic Tamil and English.

---

## 3. Bus Category Identification System

MTC operates diverse bus classes with differing fare policies and features. The system categorizes each bus using text, icons, colors, and distinct border badges (accessible for color-blind commuters):

| Category | Icon | Features & Fares | Key Benefit |
| :--- | :--- | :--- | :--- |
| **Ordinary** | 🚌 | ₹5 - ₹15 (Pink Board) | **Vidiyal Payanam: 100% Free for all women passengers** |
| **Express** | 💨 | ₹9 - ₹24 (White Board) | Faster commute with limited halts |
| **Deluxe** | ⭐ | ₹14 - ₹35 (High-Back) | 2x2 cushioned seats & smooth suspension |
| **AC Electric** | ❄️ | ₹25 - ₹60 (Electric/Volvo) | 100% climate control, low floor, zero emission |
| **Special / Night**| 🌙 | ₹15 - ₹40 (Night Link) | 24/7 midnight connectivity across Chennai |

---

## 4. How Mock Data Works

- Initialized with realistic sample datasets covering 15+ authentic Chennai MTC routes, correct stage progressions, bus models (Ashok Leyland BS-VI, Switch EiV12 Electric), fare estimates, and Tamil station nomenclature.
- Operator actions (adding a bus, altering ETA, marking delayed, changing announcements) persist in browser local storage for persistent testing across page reloads.

---

## 5. Integrating a Real-Time MTC API in Production

The architecture decouples the state store (`src/context/BusContext.tsx`) from the visual components. In a production deployment:

```
[MTC Buses GPS Units (AIS-140)] 
       │
       ▼
[Cellular Telemetry Gateway]
       │
       ▼
[MTC Backend / GTFS-Realtime Feed (VehiclePositions & TripUpdates)]
       │
       ▼
[WebSocket / Server-Sent Events (SSE) Proxy]
       │
       ▼
[BusContext.tsx: replace mock timer with useWebSocket('/api/mtc/live')]
       │
       ▼
[Public TV Display Screens at Bus Stands]
```

To connect real APIs:
1. Replace the timer interval in `BusContext.tsx` with a standard WebSocket or Server-Sent Events listener.
2. Map incoming GTFS-RT `TripUpdate` protobuf/JSON payloads to the `MTCBus` TypeScript interface.
3. Keep the display components unchanged—they seamlessly render any real-time feed.

---

## 6. Project Structure

```
├── README.md                     # System documentation & architectural roadmap
├── metadata.json                 # AI Studio configuration & permissions
├── index.html                    # Entry point with Google Noto Sans Tamil & display fonts
├── src/
│   ├── types.ts                  # TypeScript interfaces (MTCBus, BusStand, CategoryInfo)
│   ├── data/
│   │   └── mockBuses.ts          # Realistic Chennai MTC bus routes, stations & categories
│   ├── utils/
│   │   └── sound.ts              # Web Audio API transit chime synthesizer
│   ├── context/
│   │   └── BusContext.tsx        # Central real-time state, ETA countdown, admin dispatch
│   ├── components/
│   │   ├── Header.tsx            # Digital clock, bus stand switch, language & TV mode button
│   │   ├── NextBusesBoard.tsx    # High-contrast 16:9 TV arrival board with large ETAs
│   │   ├── CategoryBadge.tsx     # Color-blind safe category badges with Tamil text
│   │   ├── ETAIndicator.tsx      # Dynamic status & countdown indicator
│   │   ├── BusDetailsModal.tsx   # Progressive metro-style station stop progression line
│   │   ├── AllBusesView.tsx      # Catalog of all buses with sorting, filtering & search
│   │   ├── CategoriesGuide.tsx   # Educational guide to MTC bus categories & fares
│   │   ├── AdminPanel.tsx        # Operator admin console with Live TV Display Preview
│   │   ├── AnnouncementBar.tsx   # Bottom scrolling news & safety alert ticker
│   │   └── DocumentationView.tsx # In-app architectural manual
│   ├── App.tsx                   # Main layout container
│   ├── main.tsx                  # React application mount
│   └── index.css                 # Tailwind CSS styles & animations
```

---

## 7. How to Run the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 8. Future Improvements

1. **Text-to-Speech (TTS) Announcements**: Automated bilingual voice announcements in Tamil and English when a bus enters "Arriving Now" status.
2. **Passenger Crowd Density Sensing**: Camera or weight sensor telemetry to display real-time seat availability percentages.
3. **QR Code Interactivity**: Display a quick QR code on screen allowing passengers to take the live tracking route on their smartphones.
4. **Offline Terminal Resiliency**: Service Worker cache integration to display scheduled timetables if network connectivity drops.
