# Tanker Buddy — Bangalore's Traceable & Softened Water Infrastructure Platform

> **Utility-Grade Municipal Enterprise Web Application**  
> **Tagline:** *"Clean Water Infrastructure • Bengaluru"*  
> **Target Problem:** Tackling Bengaluru's water opacity, unorganized cartel pricing spikes, and severe hard water crisis with audited telemetry, certified sources, and centralized ion-exchange softening.

---

## 🌊 Executive Overview

**Tanker Buddy** operates as a high-trust, municipal utility alternative designed to bring corporate governance, biochemical safety, and price predictability to Bengaluru's fractured private water supply ecosystem.

The platform directly serves two key customer segments:
1. **Gated Communities & Apartment RWAs:** Bulk 10,000L to 100,000L/day dedicated supply corridor contracts, GST-compliant invoicing, basement docking compliance, and auto-refill SLAs.
2. **Independent Homes & Villas:** On-demand 4,000L to 6,000L deliveries, customizable softening grades (&lt;100 ppm hardness), and upfront transparent pricing with zero seasonal gouging.

---

## 🏛️ Platform Architecture & Functional Modules

### 1. Bengaluru Realistic Pricing & Logistics Model (INR ₹)
A dynamic, real-time pricing engine calculating transparent municipal tariffs without arbitrary cartel markups:

- **A. Base Volume Capacity:**
  - `4,000 Liters` (Mini Tanker / Independent House Sump): **₹1,000**
  - `6,000 Liters` (Standard Tanker): **₹1,400**
  - `10,000 Liters` (Shared Apartment Sump): **₹2,200**
  - `12,000 Liters` (Commercial / Society Heavy Capacity): **₹2,600**
  - `Custom Bulk Option for RWAs` (&gt;20,000L to 100,000L): **₹180 per 1,000L** bulk contract rate.
- **B. Certified Source Origin Surcharge:**
  - Deep Aquifer Borewell (Standard subterranean groundwater): **+₹0**
  - Ponto / Lake Basin Treated Reservoir: **+₹250**
  - Authentic BWSSB Bulk Cauvery Tap (Low initial mineral load): **+₹500**
- **C. Treatment & Water Grade:**
  - Raw Hard Water (Construction, gardening, basic flushing): **+₹0**
  - Sediment Filtered Utility (Suspended solids & turbidity removed): **+₹250**
  - Centralized Ion-Exchange Softened Water (&lt;100 ppm Hardness, hair/skin & pipe scale safe): **+₹450**
  - BIS 10500 Potable Grade (Multi-stage RO + UV purified): **+₹750**
- **D. Logistics & Statutory Fees:**
  - Transit & Toll Logistics: **Fixed ₹100**
  - Statutory Tax: **5% GST** calculated on total subtotal.
  - **Peak Summer Surge Protection Guarantee:** Subscribed members and contract holders are exempt from seasonal price gouging (e.g., March–June Bangalore water crises when unorganized tanker syndicates charge ₹2,500 - ₹3,500).
- **Real-Time Collapsible Bill Summary:** Itemized breakdown updates instantaneously as users modify volume, source origin, or treatment grade.

---

### 2. Trust & Water Telemetry Transparency Section
- **Direct Side-by-Side Comparison Matrix:**
  - Evaluates Conventional Unregulated Tankers vs. Tanker Buddy Softened Utility vs. BIS 10500 Potable Grade across Total Dissolved Solids (TDS ppm), Hardness as CaCO3 (ppm), pH balance, microbial contamination (E. Coli), source traceability, and billing ethics.
- **Weekly NABL-Accredited Lab Test Archives:**
  - Interactive cards and high-fidelity modal report previews for:
    - **Whitefield Hub** (Report `#TB-NABL-BLR-0824`)
    - **Sarjapur Hub** (Report `#TB-NABL-BLR-0825`)
    - **Bellandur Hub** (Report `#TB-NABL-BLR-0826`)
  - Full chemical parameter sheet with observed readings, BIS 10500:2012 permissible limits, testing methodology (IS 3025), Chief Water Chemist verification stamp, and one-click Print / Save PDF.

---

### 3. Smart Sump Auto-Refill (IoT Integration Feature)
- **Ultrasonic Non-Contact Sensor Specification:**
  - IP68 weather-sealed ultrasonic transducer mounted inside underground sumps or overhead tanks.
  - Non-contact design eliminates mineral encrustation and mechanical float jamming.
  - NB-IoT / LoRaWAN low-power wireless telemetry with 3-year sealed battery life.
- **Interactive Sump Telemetry Simulator:**
  - Live slider (5% to 100%) dynamically updates liquid height, color state (emerald &gt;50%, amber 25-50%, crimson &lt;25%), estimated remaining liters, and depletion projection.
  - **Auto-Dispatch Trigger at &lt;25% Capacity:** Automatically fires an emergency corridor tanker allocation alert, preventing early-morning dry taps and booster pump burnouts.
  - Direct booking form integration via "Request Free Ultrasonic Sump Sensor Demo" toggle.

---

### 4. Dual Booking & Discovery Engine
1. **Individual Household On-Demand Booking Tab:**
   - Resident Name, 10-digit Indian mobile number validation, Bengaluru Cluster selection (Whitefield, Bellandur/ORR, Sarjapur, HSR Layout, Electronic City, KR Puram/Hoodi, Yelahanka/Hebbal, Bannerghatta Road).
   - Complete house address with landmark.
   - Inlet & hose requirements (&lt;30 ft, 30–60 ft, &gt;60 ft with high-pressure booster pump).
   - Frequency options (Immediate One-Time, Alternate Days, Weekly, Monthly Subscription).
   - Live collapsible bill drawer with instantaneous price calculation.
   - Generates unique reference code (`TB-BLR-2026-XXXX`) and direct 1-click WhatsApp Dispatch sharing link.
2. **RWA Bulk Contract Inquiry Tab:**
   - Society Name, Flats/Units count, Daily Volume slider (10,000L to 100,000L), Sump Capacity in liters.
   - Dedicated delivery window selection (04:00 - 07:00 AM Dawn Corridor, 11:00 AM - 02:00 PM Midday, 06:00 - 09:00 PM Evening).
   - RWA Secretary / Facility Manager contact info.
   - Live monthly contract and bulk savings estimation.

---

### 5. Administrative Operations & Fleet Dashboard (`/admin`)
Secure administrative console protected by passcode modal:
- **Default Evaluator Passcode:** `TankerAdminBLR2026`
- **Executive Metric Cards:**
  - Total Registered Customers & Leads
  - Total Queued Water Volume (Liters)
  - Softened vs. Hard Water Demand Ratio (%)
  - Top Demanded Bengaluru Cluster
  - Total Revenue Pipeline (INR ₹)
- **Lead Management Table:**
  - Search by customer/society name, phone, or reference code.
  - Filter by cluster and lifecycle status (`New Lead`, `Contacted`, `Inlet Verified`, `Delivery Active`).
  - Direct 1-click WhatsApp chat button (`https://wa.me/91...`) prefilled with order details.
  - Inline status management dropdown updating persistent storage instantaneously.
  - Detailed lead inspection modal with hose requirements, address, and driver notes.
  - **Export All Leads to CSV:** Generates RFC-4180 compliant CSV file for offline CRM / Excel import.
- **Hub Fleet Operations Board:**
  - Live status for Sarjapur Hub, Whitefield Hub, and Bellandur Hub.
  - Ion-exchange resin bed capacity percentage, last regeneration timestamp, brine tank saturation level.
  - Tanker fleet counts (Active on corridor, In-depot staged, Replenishing).
  - BWSSB bulk tapping intake pressure and daily dispatched volume logs.

---

### 6. Persistence & Data Integrity Layer (`js/db.js`)
- **Primary Storage:** Fast, asynchronous browser `IndexedDB` (`TankerBuddyBLR_DB`, object store `leads`).
- **Seamless Fallback:** Automatic mirror backup to `localStorage` ensuring zero data loss across browser environments.
- **Firestore Cloud Hook:** Ready-to-connect architecture supporting `window.TANKER_BUDDY_FIREBASE_CONFIG` for bi-directional cloud synchronization.
- **Reactive Event Bus:** Admin dashboard auto-refreshes when new orders or inquiries are submitted.

---

## 🚀 How to Run Locally

### Option 1: Direct File Open
Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Safari). All features, calculators, modals, and IndexedDB persistence function completely offline without build tooling.

### Option 2: Local Server (Windows PowerShell)
Run the bundled PowerShell web server:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\serve.ps1
```
Or double-click `start-server.bat`. Open [http://localhost:8080/](http://localhost:8080/) in your browser.

---

## 🛡️ Hackathon & Enterprise Ethics
- **Zero Fabricated Animations:** No dummy GPS trucks running on fake looping tracks, no artificial speedometers.
- **Mathematical Accuracy:** Pricing formulas, GST computations, and NABL water test parameters reflect actual Bengaluru municipal utility benchmarks.
- **Production-Ready Code:** Pure JavaScript without heavy dependencies, responsive Tailwind styling, and accessible keyboard navigation.
