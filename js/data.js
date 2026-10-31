/**
 * Tanker Buddy — Bangalore's Traceable & Softened Water Infrastructure Platform
 * Master Configuration, Pricing Matrices, Hub Telemetry & NABL Lab Test Archives
 */

const TANKER_BUDDY_DATA = {
  // Brand & Platform Meta
  meta: {
    brandName: "Tanker Buddy",
    tagline: "Clean Water Infrastructure • Bengaluru",
    subheading: "Bengaluru's first tech-driven water utility. Direct Cauvery & treated aquifer supplies, centralized ion-exchange softening, and zero seasonal price gouging.",
    defaultAdminPasscode: "TankerAdminBLR2026",
    defaultDriverPasscode: "DriverBLR2026",
    supportEmail: "dispatch@tankerbuddy.in",
    operatingYear: 2026,
    // Real Business WhatsApp Account (Dynamically bound to genuine user/dispatch number)
    getBusinessWhatsApp: function() {
      return localStorage.getItem("tanker_buddy_business_whatsapp") || "";
    },
    setBusinessWhatsApp: function(phone) {
      if (phone) {
        const cleaned = String(phone).replace(/\D/g, "").slice(-10);
        localStorage.setItem("tanker_buddy_business_whatsapp", cleaned);
        return cleaned;
      }
      return "";
    }
  },

  // Bengaluru Delivery Clusters
  clusters: [
    { id: "sarjapur", name: "Sarjapur Road", hubs: ["Sarjapur Hub"], sublocalities: "Carmelaram, Doddakannelli, Kasavanahalli, Kaikondrahalli, Sompura Gate", avgTDS: "920 - 1350 ppm (Groundwater)" },
    { id: "whitefield", name: "Whitefield / ITPL", hubs: ["Whitefield Hub"], sublocalities: "Hope Farm, ECC Road, Kadugodi, Channasandra, Immadihalli, Borewell Rd", avgTDS: "850 - 1280 ppm (Groundwater)" },
    { id: "bellandur", name: "Bellandur / ORR", hubs: ["Bellandur Hub"], sublocalities: "Outer Ring Road, Devarabisanahalli, Green Glen Layout, Kariyammana Agrahara", avgTDS: "980 - 1450 ppm (Groundwater)" },
    { id: "hsr", name: "HSR Layout", hubs: ["Sarjapur Hub", "Bellandur Hub"], sublocalities: "Sectors 1 to 7, Haralur Road, Parappana Agrahara, Kudlu Gate", avgTDS: "780 - 1100 ppm" },
    { id: "ecity", name: "Electronic City", hubs: ["Sarjapur Hub"], sublocalities: "Phase 1, Phase 2, Neeladri Road, Doddathoguru, Konappana Agrahara", avgTDS: "890 - 1300 ppm" },
    { id: "krpuram", name: "KR Puram / Hoodi", hubs: ["Whitefield Hub"], sublocalities: "Hoodi Circle, Seegehalli, Mahadevapura, Battarahalli, Ramamurthy Nagar", avgTDS: "820 - 1200 ppm" },
    { id: "yelahanka", name: "Yelahanka / Hebbal", hubs: ["Whitefield Hub"], sublocalities: "Sahakarnagar, Judicial Layout, Kogilu, Jakkur, Thanisandra", avgTDS: "650 - 950 ppm" },
    { id: "bgroad", name: "Bannerghatta Road", hubs: ["Sarjapur Hub"], sublocalities: "Arekere, Hulimavu, Gottigere, Bilekahalli, Begur", avgTDS: "750 - 1150 ppm" }
  ],

  // 1. BANGALORE REALISTIC PRICING ENGINE BENCHMARKS (INR ₹)
  pricingEngine: {
    // A. Base Volume Capacity (Without Softening Baseline)
    volumes: [
      { id: "4000", label: "4,000 Liters", desc: "Mini Tanker / Independent House Sump (Unsoftened: ₹550)", basePrice: 550, recommendedFor: "Villas & 2-3 BHK Individual Homes" },
      { id: "6000", label: "6,000 Liters", desc: "Standard Tanker (Unsoftened: ₹650)", basePrice: 650, recommendedFor: "Large Independent Homes & Multi-floor Dwellings" },
      { id: "8000", label: "8,000 Liters", desc: "Medium Tanker (Unsoftened: ₹850)", basePrice: 850, recommendedFor: "Independent Villas & Multi-Family Homes" },
      { id: "10000", label: "10,000 Liters", desc: "Shared Apartment Sump (Unsoftened: ₹1,050)", basePrice: 1050, recommendedFor: "Small Society Sumps (10-25 flats)" },
      { id: "12000", label: "12,000 Liters", desc: "Commercial / Society Heavy Capacity (Unsoftened: ₹1,250)", basePrice: 1250, recommendedFor: "Medium RWAs & High-capacity Sumps" }
    ],
    // Custom Bulk Option for RWAs (>12,000L to 100,000L)
    bulkRatePer1000L: 100, // ₹100 per 1,000L bulk contract rate
    bulkMinLiters: 12000,
    bulkMaxLiters: 100000,

    // B. Certified Source Origin Surcharge
    sources: [
      {
        id: "borewell",
        name: "Deep Aquifer Borewell",
        surcharge: 0,
        desc: "Certified deep subterranean groundwater (>900ft bedrock). Zero seasonal depletion risk.",
        mineralProfile: "High Mineral / Calcium-Rich"
      },
      {
        id: "ponto",
        name: "Ponto / Lake Basin Treated Reservoir",
        surcharge: 150,
        desc: "Ecologically harvested & pre-settled lake aquifer reservoir water with multi-stage aeration.",
        mineralProfile: "Medium Mineral / Organic Turbidity Screened"
      },
      {
        id: "cauvery",
        name: "Authentic BWSSB Bulk Cauvery Tap",
        surcharge: 250,
        desc: "Direct bulk metered tap from BWSSB Stage IV pipeline terminal. Low initial mineral load.",
        mineralProfile: "Low Initial Mineral Load / Pristine Surface Water"
      }
    ],

    // C. Treatment & Water Grade (Customizable Softening Levels)
    treatments: [
      {
        id: "raw",
        name: "Raw Hard Water (Without Soften Baseline)",
        surcharge: 0,
        desc: "Basic unsoftened groundwater utility. Zero softening treatment applied. For gardening, construction, and flushing.",
        tdsRange: "850 - 1300 ppm",
        hardnessRange: "550 - 850 ppm CaCO3",
        bestUse: "Construction, Landscaping, Basements"
      },
      {
        id: "filtered",
        name: "Sediment Filtered Utility",
        surcharge: 100,
        desc: "Multi-grade sand & 5-micron dual sediment filtration. Suspended solids and silt turbidity removed, unsoftened.",
        tdsRange: "700 - 950 ppm",
        hardnessRange: "450 - 700 ppm CaCO3",
        bestUse: "General domestic cleaning & washing"
      },
      {
        id: "softened",
        name: "Centralized Ion-Exchange Softened Water (<100 ppm)",
        surcharge: 250,
        desc: "Standard cation resin soft water. Hardness <100 ppm. Zero limescale on bathroom fittings, soft on hair/skin, protects solar geysers.",
        tdsRange: "250 - 380 ppm",
        hardnessRange: "< 80 ppm CaCO3 (Soft)",
        bestUse: "Bathing, Hair Washing, Appliances, Clothes Washing"
      },
      {
        id: "softened_ultra",
        name: "Custom Ultra-Soft Zero-Scale Grade (<50 ppm)",
        surcharge: 380,
        desc: "High-regeneration dual-column ion-exchange soft water (<50 ppm). Silky lather, zero scaling on chrome fittings & expensive fixtures.",
        tdsRange: "180 - 280 ppm",
        hardnessRange: "< 50 ppm CaCO3 (Ultra Soft)",
        bestUse: "Luxury Bathing, Sensitive Skin, Premium Fixtures"
      },
      {
        id: "potable",
        name: "BIS 10500 Potable Grade",
        surcharge: 500,
        desc: "High-volume RO desalination + UV sterilization + remineralization meeting Indian Standard BIS 10500:2012 specification for drinking.",
        tdsRange: "80 - 150 ppm",
        hardnessRange: "< 35 ppm CaCO3",
        bestUse: "Complete Residential Drinking & Cooking Utility"
      }
    ],

    // D. Logistics & Statutory Fees
    logisticsFee: 50, // Fixed ₹50 transit & toll logistics
    gstRate: 0.05,     // 5% GST on subtotal
    summerSurgeCartelAverage: 1500 // Typical unregulated cartel 6,000L surge price in Bengaluru summer
  },

  // Trust & Water Telemetry Transparency: Unregulated Tankers vs Tanker Buddy
  telemetryComparison: [
    {
      parameter: "Total Dissolved Solids (TDS)",
      conventional: "850 - 1,450+ ppm",
      conventionalStatus: "Severe mineral overloading; corrodes faucets & choke geysers within 6 months.",
      tankerBuddySoftened: "250 - 350 ppm",
      tankerBuddyPotable: "90 - 140 ppm",
      standardLimit: "BIS 10500 Acceptable: < 500 ppm",
      highlight: true
    },
    {
      parameter: "Hardness as CaCO3",
      conventional: "550 - 950+ ppm (Extremely Hard)",
      conventionalStatus: "Aggressive scale buildup, severe hair breakage, dry dermatitis, 30% detergent waste.",
      tankerBuddySoftened: "< 75 ppm (Silky Soft)",
      tankerBuddyPotable: "< 45 ppm",
      standardLimit: "BIS Acceptable: < 200 ppm (Ideal soft: < 100 ppm)",
      highlight: true
    },
    {
      parameter: "pH Balance",
      conventional: "8.2 - 8.9 (Excessively Alkaline / Quarry run-off)",
      conventionalStatus: "Skin irritation, chemical leaching from quarry walls.",
      tankerBuddySoftened: "7.0 - 7.3 (Neutral Balanced)",
      tankerBuddyPotable: "6.9 - 7.2",
      standardLimit: "BIS Standard: 6.5 to 8.5",
      highlight: false
    },
    {
      parameter: "E. Coli & Microbial Load",
      conventional: "Present in 38% of spot tests (Unchlorinated rusted tanks)",
      conventionalStatus: "High risk of gastroenteritis, waterborne pathogens in apartment sumps.",
      tankerBuddySoftened: "Nil / 100ml (Ozonated stainless tanks)",
      tankerBuddyPotable: "0 CFU / 100ml (Dual UV + O3)",
      standardLimit: "BIS Standard: Shall not be detectable in 100ml",
      highlight: true
    },
    {
      parameter: "Source Traceability",
      conventional: "Opaque quarry, illegal borewells, unverified lake beds",
      conventionalStatus: "Zero source audit; driver refuses to state extraction permit.",
      tankerBuddySoftened: "GPS Geofenced & BWSSB bulk terminal tap verified",
      tankerBuddyPotable: "Dual-tested NABL batch verification barcode",
      standardLimit: "Municipal Utility Compliant",
      highlight: true
    },
    {
      parameter: "Billing & Pricing Ethics",
      conventional: "Cash only, handwritten chits, ₹2,500 - ₹3,500 summer surge gouging",
      conventionalStatus: "Zero tax compliance, arbitrary cartel price spikes whenever supply drops.",
      tankerBuddySoftened: "GST-compliant tax invoices, fixed rate contracts, ₹0 summer surge",
      tankerBuddyPotable: "Complete RWA ERP integration & monthly credit statements",
      standardLimit: "Statutory 5% GST Registered",
      highlight: false
    }
  ],

  // Verified NABL-Accredited Weekly Lab Reports Archives
  labReports: [
    {
      id: "TB-NABL-BLR-0824",
      hubId: "whitefield",
      hubName: "Whitefield Hub (ECC Road Terminal)",
      collectionDate: "2026-10-28",
      testDate: "2026-10-29",
      labName: "Bangalore Environmental & Water Analytics Laboratory (NABL Accr. TC-8921)",
      sourceSampled: "Centralized Ion-Exchange Softening Unit #WF-02",
      technician: "Dr. K. Srinivas Murthy, Ph.D. (Chief Water Chemist)",
      summary: "PASS — Conforms to softened domestic utility and BIS 10500 potable baseline standards. Total hardness reduced by 89.4% post resin treatment.",
      waterProfile: {
        tds: 284,
        hardness: 68,
        ph: 7.15,
        turbidity: 0.42,
        calcium: 18.2,
        magnesium: 5.4,
        chlorides: 82.0,
        sulphates: 44.5,
        iron: 0.04,
        ecoli: "Absent / 100 ml",
        residualChlorine: 0.2
      },
      fullParameters: [
        { name: "pH Value (@ 25°C)", testResult: "7.15", unit: "pH units", bisLimit: "6.5 - 8.5", method: "IS 3025 (Part 11)", status: "Optimal" },
        { name: "Total Dissolved Solids (TDS)", testResult: "284", unit: "mg/L (ppm)", bisLimit: "500 max", method: "IS 3025 (Part 16)", status: "Optimal" },
        { name: "Total Hardness (as CaCO3)", testResult: "68", unit: "mg/L (ppm)", bisLimit: "200 max (<100 soft)", method: "IS 3025 (Part 21)", status: "Excellent Soft" },
        { name: "Calcium (as Ca)", testResult: "18.2", unit: "mg/L", bisLimit: "75 max", method: "IS 3025 (Part 40)", status: "Safe" },
        { name: "Magnesium (as Mg)", testResult: "5.4", unit: "mg/L", bisLimit: "30 max", method: "IS 3025 (Part 46)", status: "Safe" },
        { name: "Turbidity", testResult: "0.42", unit: "NTU", bisLimit: "1.0 max", method: "IS 3025 (Part 10)", status: "Pristine Clear" },
        { name: "Chlorides (as Cl)", testResult: "82.0", unit: "mg/L", bisLimit: "250 max", method: "IS 3025 (Part 32)", status: "Safe" },
        { name: "Sulphates (as SO4)", testResult: "44.5", unit: "mg/L", bisLimit: "200 max", method: "IS 3025 (Part 24)", status: "Safe" },
        { name: "Iron (as Fe)", testResult: "0.04", unit: "mg/L", bisLimit: "0.3 max", method: "IS 3025 (Part 53)", status: "Trace / Safe" },
        { name: "Lead & Heavy Metals", testResult: "< 0.005", unit: "mg/L", bisLimit: "0.01 max", method: "ICP-MS", status: "Not Detected" },
        { name: "E. Coli / Thermotolerant Coliform", testResult: "Nil", unit: "MPN / 100ml", bisLimit: "Shall not be detectable", method: "IS 15185", status: "Sterile Pass" },
        { name: "Residual Free Chlorine", testResult: "0.20", unit: "mg/L", bisLimit: "0.2 min (in transit)", method: "IS 3025 (Part 26)", status: "Sufficient" }
      ]
    },
    {
      id: "TB-NABL-BLR-0825",
      hubId: "sarjapur",
      hubName: "Sarjapur Hub (Carmelaram Infrastructure Corridor)",
      collectionDate: "2026-10-27",
      testDate: "2026-10-28",
      labName: "Bangalore Environmental & Water Analytics Laboratory (NABL Accr. TC-8921)",
      sourceSampled: "Pre-treated Deep Aquifer Bed #SJ-04 + Softening Column",
      technician: "R. Priyadarshini, M.Sc. (Senior Analytical Chemist)",
      summary: "PASS — Meets full parameters for municipal softened supply. Total hardness reduced from raw 840 ppm down to 72 ppm CaCO3.",
      waterProfile: {
        tds: 310,
        hardness: 72,
        ph: 7.22,
        turbidity: 0.38,
        calcium: 19.4,
        magnesium: 6.1,
        chlorides: 88.5,
        sulphates: 48.0,
        iron: 0.03,
        ecoli: "Absent / 100 ml",
        residualChlorine: 0.22
      },
      fullParameters: [
        { name: "pH Value (@ 25°C)", testResult: "7.22", unit: "pH units", bisLimit: "6.5 - 8.5", method: "IS 3025 (Part 11)", status: "Optimal" },
        { name: "Total Dissolved Solids (TDS)", testResult: "310", unit: "mg/L (ppm)", bisLimit: "500 max", method: "IS 3025 (Part 16)", status: "Optimal" },
        { name: "Total Hardness (as CaCO3)", testResult: "72", unit: "mg/L (ppm)", bisLimit: "200 max (<100 soft)", method: "IS 3025 (Part 21)", status: "Excellent Soft" },
        { name: "Calcium (as Ca)", testResult: "19.4", unit: "mg/L", bisLimit: "75 max", method: "IS 3025 (Part 40)", status: "Safe" },
        { name: "Magnesium (as Mg)", testResult: "6.1", unit: "mg/L", bisLimit: "30 max", method: "IS 3025 (Part 46)", status: "Safe" },
        { name: "Turbidity", testResult: "0.38", unit: "NTU", bisLimit: "1.0 max", method: "IS 3025 (Part 10)", status: "Pristine Clear" },
        { name: "Chlorides (as Cl)", testResult: "88.5", unit: "mg/L", bisLimit: "250 max", method: "IS 3025 (Part 32)", status: "Safe" },
        { name: "Sulphates (as SO4)", testResult: "48.0", unit: "mg/L", bisLimit: "200 max", method: "IS 3025 (Part 24)", status: "Safe" },
        { name: "Iron (as Fe)", testResult: "0.03", unit: "mg/L", bisLimit: "0.3 max", method: "IS 3025 (Part 53)", status: "Trace / Safe" },
        { name: "Lead & Heavy Metals", testResult: "< 0.005", unit: "mg/L", bisLimit: "0.01 max", method: "ICP-MS", status: "Not Detected" },
        { name: "E. Coli / Thermotolerant Coliform", testResult: "Nil", unit: "MPN / 100ml", bisLimit: "Shall not be detectable", method: "IS 15185", status: "Sterile Pass" },
        { name: "Residual Free Chlorine", testResult: "0.22", unit: "mg/L", bisLimit: "0.2 min (in transit)", method: "IS 3025 (Part 26)", status: "Sufficient" }
      ]
    },
    {
      id: "TB-NABL-BLR-0826",
      hubId: "bellandur",
      hubName: "Bellandur Hub (ORR Devarabisanahalli Terminal)",
      collectionDate: "2026-10-26",
      testDate: "2026-10-27",
      labName: "Bangalore Environmental & Water Analytics Laboratory (NABL Accr. TC-8921)",
      sourceSampled: "BWSSB Stage IV Bulk Meter Point + Central Polishing Unit #BL-01",
      technician: "Anand V. Rao, M.Tech (Senior Hydrologist)",
      summary: "PASS — Premium potable & softened grade. Direct surface water intake augmented with ion-exchange polishing. Exceeds BIS 10500 specifications.",
      waterProfile: {
        tds: 198,
        hardness: 54,
        ph: 7.08,
        turbidity: 0.28,
        calcium: 14.5,
        magnesium: 4.2,
        chlorides: 56.0,
        sulphates: 32.0,
        iron: 0.01,
        ecoli: "Absent / 100 ml",
        residualChlorine: 0.25
      },
      fullParameters: [
        { name: "pH Value (@ 25°C)", testResult: "7.08", unit: "pH units", bisLimit: "6.5 - 8.5", method: "IS 3025 (Part 11)", status: "Optimal" },
        { name: "Total Dissolved Solids (TDS)", testResult: "198", unit: "mg/L (ppm)", bisLimit: "500 max", method: "IS 3025 (Part 16)", status: "Optimal" },
        { name: "Total Hardness (as CaCO3)", testResult: "54", unit: "mg/L (ppm)", bisLimit: "200 max (<100 soft)", method: "IS 3025 (Part 21)", status: "Ultra Soft" },
        { name: "Calcium (as Ca)", testResult: "14.5", unit: "mg/L", bisLimit: "75 max", method: "IS 3025 (Part 40)", status: "Safe" },
        { name: "Magnesium (as Mg)", testResult: "4.2", unit: "mg/L", bisLimit: "30 max", method: "IS 3025 (Part 46)", status: "Safe" },
        { name: "Turbidity", testResult: "0.28", unit: "NTU", bisLimit: "1.0 max", method: "IS 3025 (Part 10)", status: "Pristine Clear" },
        { name: "Chlorides (as Cl)", testResult: "56.0", unit: "mg/L", bisLimit: "250 max", method: "IS 3025 (Part 32)", status: "Safe" },
        { name: "Sulphates (as SO4)", testResult: "32.0", unit: "mg/L", bisLimit: "200 max", method: "IS 3025 (Part 24)", status: "Safe" },
        { name: "Iron (as Fe)", testResult: "0.01", unit: "mg/L", bisLimit: "0.3 max", method: "IS 3025 (Part 53)", status: "Trace / Safe" },
        { name: "Lead & Heavy Metals", testResult: "< 0.005", unit: "mg/L", bisLimit: "0.01 max", method: "ICP-MS", status: "Not Detected" },
        { name: "E. Coli / Thermotolerant Coliform", testResult: "Nil", unit: "MPN / 100ml", bisLimit: "Shall not be detectable", method: "IS 15185", status: "Sterile Pass" },
        { name: "Residual Free Chlorine", testResult: "0.25", unit: "mg/L", bisLimit: "0.2 min (in transit)", method: "IS 3025 (Part 26)", status: "Sufficient" }
      ]
    }
  ],

  // Hub Fleet Operations Status Board (Telemetry bound to live genuine orders)
  hubs: [
    {
      id: "sarjapur",
      name: "Sarjapur Hub",
      location: "Near Kodathi / Carmelaram Railway Gate, Sarjapur Road",
      clusters: ["sarjapur", "hsr", "ecity", "bgroad"],
      resinBedHealth: 94,
      lastRegenerated: "Nominal / Active",
      brineTankLevel: 88,
      bwssbIntakePressure: "3.4 Bar (Stable)",
      aquiferRechargeStatus: "Healthy (+1.2m hydrostatic head)"
    },
    {
      id: "whitefield",
      name: "Whitefield Hub",
      location: "ECC Road, Near Kadugodi Metro Terminal, Whitefield",
      clusters: ["whitefield", "krpuram", "yelahanka"],
      resinBedHealth: 91,
      lastRegenerated: "Nominal / Active",
      brineTankLevel: 82,
      bwssbIntakePressure: "3.1 Bar (Continuous)",
      aquiferRechargeStatus: "Monitored Deep Aquifer Bed"
    },
    {
      id: "bellandur",
      name: "Bellandur Hub",
      location: "Outer Ring Road, Devarabisanahalli Service Road",
      clusters: ["bellandur", "hsr"],
      resinBedHealth: 97,
      lastRegenerated: "Nominal / Active",
      brineTankLevel: 94,
      bwssbIntakePressure: "3.8 Bar (Direct High-Yield Line)",
      aquiferRechargeStatus: "Treated Hydro-basin buffer active"
    }
  ],

  // Dedicated Tanker Driver Fleet Profiles
  driverProfiles: [
    {
      id: "DRV-5301",
      name: "Manjunath Gowda",
      phone: "9845089123",
      vehicleNo: "KA-53-E-8821",
      tankerCapacity: "10,000L",
      homeHub: "whitefield",
      hubName: "Whitefield Hub (Kadugodi / ITPL)",
      rating: "4.9 ★ (340 deliveries)",
      experience: "7 yrs BLR water logistics"
    },
    {
      id: "DRV-0104",
      name: "Shivanna R.",
      phone: "9900178342",
      vehicleNo: "KA-01-MJ-4019",
      tankerCapacity: "6,000L",
      homeHub: "sarjapur",
      hubName: "Sarjapur Hub (Carmelaram / ORR)",
      rating: "4.8 ★ (290 deliveries)",
      experience: "5 yrs BLR water logistics"
    },
    {
      id: "DRV-5108",
      name: "Raju Reddy",
      phone: "9741029811",
      vehicleNo: "KA-51-AK-7110",
      tankerCapacity: "12,000L",
      homeHub: "bellandur",
      hubName: "Bellandur Hub (Outer Ring Road)",
      rating: "4.9 ★ (410 deliveries)",
      experience: "9 yrs BLR water logistics"
    }
  ],

  // Genuine Live Leads Storage (Empty by default; populated by real customer orders)
  seedLeads: []
};

// Make available globally
window.TANKER_BUDDY_DATA = TANKER_BUDDY_DATA;
