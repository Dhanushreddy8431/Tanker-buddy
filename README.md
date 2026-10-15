# CIRCULAR — Design Electronics for Repair, Reuse & Recovery

> **Hackathon Challenge:** IMX26-PS07 — CEDA-EPS (Circular Economy Digital Architecture)  
> **Headline:** *"The best device is the one you don’t have to replace."*  
> **Architecture:** Modern Climate-Tech / Open Hardware Heuristic Platform

---

## 🌍 Executive Summary

**CIRCULAR** is a digital platform engineered to combat the 62-million-ton global electronic waste crisis. By establishing an open heuristic triage framework, democratizing repair teardown specifications, facilitating decentralized independent technician connections, and enforcing NIST 800-88 cryptographic sanitization for secondary life, CIRCULAR operationalizes the Ellen MacArthur Foundation electronics cascade.

---

## 🎯 Target Users & Stakeholders

1. **Consumers & Device Owners:** Fast, non-technical assessments of hardware health, repairability scores, transparent cost estimates, and critical safety warnings (such as swollen battery hazard alerts).
2. **Independent Repair Shops & Micro-Technicians:** A decentralized directory connecting local microsoldering labs and right-to-repair workshops with consumers.
3. **Refurbishers & Secondary Donors:** Practical data sanitization and cloud activation unlock guides to divert functional hardware to students and civic organizations.
4. **Hackathon Judges & Evaluators:** Fully interactive prototype with zero dead buttons, realistic Life Cycle Assessment (LCA) demo modeling, and a fast-track judge tour toolbar.

---

## 🏛️ Platform Architecture & Key Features

### 1. Home & The Circular Journey
- **Hero & Ethical Charter:** Clear single-sentence mandate prioritizing lifetime extension before material downcycling.
- **Interactive Circular Journey:** 4 clickable lifecycle stages (`Diagnose` &rarr; `Repair` &rarr; `Reuse` &rarr; `Recover`) with real-time telemetry inspector.
- **Sample Impact Panel:** Clearly labeled demo metrics for GHG emissions averted, e-waste diverted, critical cobalt conserved, and consumer dollars saved.
- **Featured Specimen Teardowns:** Real hardware examples (ThinkPad T480, iPhone 13 Pro, Framework Laptop 13).

### 2. Device Checker — The Core Interactive Demo
- **Step 1: Category Selection:** Interactive cards for Smartphones, Laptops, Tablets, and Audio/Wearables.
- **Step 2: Model & Brand:** Preloaded 1-click demo presets (e.g., iPhone 13 Pro, ThinkPad T480, iPad 9th Gen, Galaxy S22, Framework 13) plus custom model input.
- **Step 3: Symptom Taxonomy:** Screen crack, battery degradation, charging port failure, thermal throttling, liquid ingress, or swollen battery.
- **Step 4: Health Context:** Device age, boot power status, battery bulging inspection, and file backup audit.
- **Step 5: Dynamic Diagnostic Results:**
  - Unique Diagnostic ID (`DIAG-2026-XXXX`).
  - Repairability Score (0 to 10) with modularity breakdown.
  - Recommended Pathway Badge (`DIY Preferred`, `Professional Bench`, `Safety Advisory`, or `Second Life`).
  - Repair vs Replacement Cost & Carbon Matrix.
  - Parts & Tools Kit Checklist with interactive checkmarks.
  - Critical Safety Guidance (urgent high-visibility banner when battery swelling is detected).
  - One-click transitions to matching repair guides, local technicians, and print reports.

### 3. Community Repair Library
- Real-time search across devices, symptoms, and tools.
- Multi-criteria filtering by category and difficulty (Beginner, Intermediate, Advanced).
- **Interactive Guide Reader Modal:**
  - Step-by-step progress tracker with interactive checkmarks.
  - Exploded CAD schematic diagram visualization.
  - Safety alerts and torque sequences.
  - Required tools and replacement parts checklist.

### 4. Independent Repair Network
- Searchable workshop directory with city and specialty filters.
- Verified status badges, average turnaround times, transparent indicative pricing, and customer ratings.
- **Direct Workshop Booking Modal:** Pre-populates assessed device details and generates confirmation tickets (`TICKET-2026-XXXX`).
- **"List Your Repair Service" Form:** Interactive onboarding modal with field validation and mock registration IDs (`REG-2026-XXXX`).

### 5. Give a Device a Second Life
- 4 Circular Pathways: Donate (Digital Equity), Sell (Hardware Residual), Repurpose (Maker Node), and Certified Smelting.
- **Interactive Pre-Handoff Cryptographic Erasure Wizard:** Operating-system specific guides for iOS, Android, Windows, and macOS (disabling iCloud activation locks, Google FRP, BitLocker, and cryptographic wipe).
- **Interactive Handoff Checklist:** Pre-flight audit with downloadable/printable sanitization certificates.
- **Certified E-Waste Drop-Off Locator:** Postal code query returning verified R2v3 and e-Stewards recycling centers.
- **Reuse vs Recycling Truth Table:** Quantifying why lifetime extension delivers 20x higher carbon leverage than premature material smelting.

### 6. About & Impact (CEDA-EPS Judge Brief)
- **Interactive Circular Impact Calculator:** Real-time range sliders modeling hardware volumes to calculate averted metric tons of CO2e, diverted e-waste kg, conserved cobalt/gold, and consumer financial savings.
- **Feasibility & Deployment Roadmap:** 3-Phase pilot plan (University Campus Pilot &rarr; Municipal Drop-Off Integration &rarr; National Refurbished Parts Exchange).
- **Prospective Partners:** Transparently labeled prospective ecosystem (iFixit API, Repair.org, R2v3 recyclers).
- **Cryptographic Impact Telemetry:** Serial number hash tracking to prevent carbon credit double-counting.

---

## 🚀 How to Run Locally

### Option 1: Direct File Open
Simply double-click or open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari). No installation, npm build, or external server required!

### Option 2: Localhost Server (Windows)
Double-click `start-server.bat` or run:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\serve.ps1
```
Open [http://localhost:8080/](http://localhost:8080/) in your browser.

---

## 🎨 Design System & Palette

- **Canvas Background:** `#FAF8F5` (Warm off-white, gallery-grade)
- **Primary Forest Text:** `#0D2818` (Deep, commanding forest green)
- **Vivid Lime Accent:** `#B8F349` / `#EBFCCE` (Clean technical energy)
- **Restrained Charcoal & Slate:** `#1E2522` / `#687970`
- **Typography:** Plus Jakarta Sans (Editorial) & JetBrains Mono (Technical Telemetry)
- **Component Geometry:** Crisp cards, subtle borders (`#E4DFD5`), zero generic green gradients or bloated glassmorphism.

---

## ⚖️ Hackathon Ethics & Competition Integrity

- **Zero Fabricated Claims:** All figures are clearly identified as illustrative demonstration data based on peer-reviewed Life Cycle Assessments (UN E-waste Monitor, Apple LCA benchmarks).
- **No Fake Endorsements:** Prospective integration partners (iFixit, Repair.org) are explicitly stated as target pilot integrations.
- **Algorithmic Neutrality:** CIRCULAR prioritizes repair first and refuses manufacturer advertising kickbacks.
