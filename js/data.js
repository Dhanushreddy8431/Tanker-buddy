/**
 * CIRCULAR — Platform Dataset
 * Challenge: IMX26-PS07 — CEDA-EPS
 * Transparent, realistic, community-based hardware triage & circular economy database.
 * NOTE: All figures and estimates are marked as illustrative demo data for competition evaluation.
 */

const CIRCULAR_DATA = {
  challengeInfo: {
    title: "CIRCULAR",
    tagline: "Design Electronics for Repair, Reuse & Recovery",
    code: "IMX26-PS07",
    track: "CEDA-EPS — Circular Economy Digital Architecture",
    framework: "Ellen MacArthur Foundation Electronics Cascade",
    version: "v2.4 Hackathon Build"
  },

  deviceCategories: [
    {
      id: "phone",
      name: "Smartphone",
      desc: "iOS, Android, modular handsets",
      icon: "smartphone",
      commonFailures: ["Screen crack", "Battery wear", "USB-C/Lightning port lint", "Microphone"]
    },
    {
      id: "laptop",
      name: "Laptop",
      desc: "Ultrabooks, workstations, MacBooks",
      icon: "laptop",
      commonFailures: ["Thermal throttling", "Battery swelling", "Keycaps", "Trackpad"]
    },
    {
      id: "tablet",
      name: "Tablet",
      desc: "iPads, Surface, Galaxy Tabs",
      icon: "tablet",
      commonFailures: ["Digitizer glass crack", "Battery cycle count", "Charging port pin wear"]
    },
    {
      id: "wearable",
      name: "Wearable & Audio",
      desc: "Smartwatches, ANC headphones, earbuds",
      icon: "headphones",
      commonFailures: ["Micro-battery degradation", "Ear cushion tears", "Water seal failure"]
    }
  ],

  presetDevices: [
    {
      id: "iphone-13-pro",
      category: "phone",
      brand: "Apple",
      model: "iPhone 13 Pro (A2638)",
      year: 2021,
      repairabilityScore: 6.8,
      scoreExplanation: "Display and battery are individually accessible once adhesive is softened. Requires specialized P2 Pentalobe and Tri-point Y000 drivers. Part serialization may trigger non-genuine display/battery notifications without calibration.",
      fasteners: "P2 Pentalobe, Tri-point Y000, Phillips #000",
      modularity: "Moderate (glued back glass, modular display & battery)",
      avgNewPrice: 999,
      carbonEmbodiedKg: 69
    },
    {
      id: "thinkpad-t480",
      category: "laptop",
      brand: "Lenovo",
      model: "ThinkPad T480 / T14 Gen 1",
      year: 2018,
      repairabilityScore: 9.3,
      scoreExplanation: "Gold standard for maintainability. Dual modular batteries, standard SO-DIMM DDR4 sockets, swappable M.2 NVMe, accessible keyboard screws, and zero proprietary glue.",
      fasteners: "Standard Phillips #1 throughout",
      modularity: "High (fully socketed memory, swappable dual battery, modular keyboard)",
      avgNewPrice: 1250,
      carbonEmbodiedKg: 240
    },
    {
      id: "ipad-9th",
      category: "tablet",
      brand: "Apple",
      model: "iPad (9th Gen, 10.2-inch)",
      year: 2021,
      repairabilityScore: 4.5,
      scoreExplanation: "Front glass digitizer is separate from LCD (cost-effective repair if LCD is intact), but heavy perimeter adhesive requires careful heating to avoid fracturing display flex cables.",
      fasteners: "Phillips #00, Heavy perimeter acrylic adhesive",
      modularity: "Low-Moderate (separate digitizer and LCD, heavily glued battery)",
      avgNewPrice: 329,
      carbonEmbodiedKg: 85
    },
    {
      id: "galaxy-s22",
      category: "phone",
      brand: "Samsung",
      model: "Galaxy S22 5G",
      year: 2022,
      repairabilityScore: 5.9,
      scoreExplanation: "Curved rear glass requires precise 80°C heat application to unseat. Battery has strong adhesive without pull tabs; isopropyl alcohol softening required.",
      fasteners: "Phillips #00, pre-cut rear panel water-resistant tape",
      modularity: "Moderate (modular cameras and daughterboards)",
      avgNewPrice: 799,
      carbonEmbodiedKg: 62
    },
    {
      id: "framework-13",
      category: "laptop",
      brand: "Framework",
      model: "Framework Laptop 13 (Intel 13th / AMD 7040)",
      year: 2023,
      repairabilityScore: 10.0,
      scoreExplanation: "Purpose-built for the circular economy. Magnetic bezel, single screwdriver included in box, captive screws that never get lost, QR codes for parts on every subsystem.",
      fasteners: "Captive T5 Torx (single driver included)",
      modularity: "Maximum (hot-swappable expansion cards, modular mainboard upgrades)",
      avgNewPrice: 1049,
      carbonEmbodiedKg: 190
    }
  ],

  issueTaxonomy: [
    {
      id: "screen",
      label: "Cracked or Unresponsive Screen",
      categoryMatch: ["phone", "laptop", "tablet"],
      urgency: "Normal",
      typicalFix: "Front display glass / OLED panel assembly replacement",
      partsEstimatedUsd: [35, 110],
      diyTimeMins: [35, 60],
      proTimeHours: [1, 2]
    },
    {
      id: "battery-degraded",
      label: "Battery Draining Fast / Low Capacity",
      categoryMatch: ["phone", "laptop", "tablet", "wearable"],
      urgency: "Normal",
      typicalFix: "Fresh OEM-spec pouch cell installation & thermal adhesive refresh",
      partsEstimatedUsd: [25, 65],
      diyTimeMins: [25, 45],
      proTimeHours: [0.5, 1.5]
    },
    {
      id: "battery-swollen",
      label: "Swollen / Bulging Battery (Pushing Screen/Back)",
      categoryMatch: ["phone", "laptop", "tablet"],
      urgency: "CRITICAL_SAFETY",
      typicalFix: "Immediate safe isolation, discharge below 25%, ESD extraction",
      partsEstimatedUsd: [30, 80],
      diyTimeMins: [45, 90],
      proTimeHours: [1, 3]
    },
    {
      id: "charging-port",
      label: "Won't Charge / Loose USB-C or Lightning Port",
      categoryMatch: ["phone", "laptop", "tablet"],
      urgency: "Low-Normal",
      typicalFix: "Port lint debridement under microscope or sub-daughterboard replacement",
      partsEstimatedUsd: [12, 35],
      diyTimeMins: [15, 40],
      proTimeHours: [0.5, 1]
    },
    {
      id: "overheating-slow",
      label: "Extreme Overheating / Fan Screaming / Thermal Throttling",
      categoryMatch: ["laptop", "phone"],
      urgency: "Normal",
      typicalFix: "Copper heatsink dust clearing & high-viscosity thermal paste repaste",
      partsEstimatedUsd: [8, 18],
      diyTimeMins: [20, 40],
      proTimeHours: [0.5, 1]
    },
    {
      id: "liquid-ingress",
      label: "Liquid Ingress / Accidental Spill",
      categoryMatch: ["phone", "laptop", "tablet"],
      urgency: "High",
      typicalFix: "Immediate battery disconnect, 99% IPA ultrasonic bath, corroded SMD replacement",
      partsEstimatedUsd: [40, 150],
      diyTimeMins: [60, 180],
      proTimeHours: [2, 24]
    },
    {
      id: "boot-os",
      label: "Boot Loop / OS Glitch / Black Screen with Vibration",
      categoryMatch: ["phone", "laptop", "tablet"],
      urgency: "Normal",
      typicalFix: "Recovery firmware flash, SSD health SMART inspection, or RAM reseat",
      partsEstimatedUsd: [0, 45],
      diyTimeMins: [20, 50],
      proTimeHours: [1, 3]
    }
  ],

  repairGuides: [
    {
      id: "guide-iphone13-battery",
      title: "iPhone 13 Pro Battery Replacement & Adhesive Seal Rejuvenation",
      device: "Apple iPhone 13 Pro",
      category: "phone",
      difficulty: "Intermediate",
      timeEstimate: "45 mins",
      repairabilityScore: 7.2,
      badge: "Community Verified Demo",
      tools: ["P2 Pentalobe Screwdriver", "Tri-point Y000 Driver", "Suction Handle", "Plastic Opening Picks", "Heat Gun / Heat Pad (75°C)", "99% Isopropyl Alcohol", "Precision Tweezers"],
      parts: ["New Li-Ion Battery Pouch (3,095 mAh)", "Pre-cut Display Water-Resistant Gasket", "Battery Stretch-Release Adhesive Tabs"],
      safetyWarning: "WARNING: Never puncture, bend, or pry against the lithium pouch with metal tools. Keep a non-flammable sand bucket or battery safety bag nearby in the event of thermal runaway.",
      steps: [
        {
          num: 1,
          title: "Discharge & Power Down",
          desc: "Discharge the iPhone below 25% battery charge to reduce fire risk if accidentally punctured. Turn off the device completely and remove the SIM tray.",
          tip: "A discharged battery is significantly less reactive if the pouch is stressed."
        },
        {
          num: 2,
          title: "Remove P2 Pentalobe Screws",
          desc: "Unthread the two 6.8 mm P2 Pentalobe screws located on either side of the Lightning charging connector at the bottom edge.",
          tip: "Keep screws organized in a magnetic tray; they are easily stripped."
        },
        {
          num: 3,
          title: "Soften Perimeter Waterproof Seal",
          desc: "Apply mild heat (70°C to 75°C) across the bottom and side perimeter of the screen for 2-3 minutes. Position the suction cup near the bottom edge.",
          tip: "Do not exceed 80°C or you risk damaging the OLED polarizing layer."
        },
        {
          num: 4,
          title: "Separate Screen Assembly (Left Swing)",
          desc: "Gently pull the suction cup to create a hairline gap. Insert an opening pick no more than 3mm. Carefully slice through the adhesive, swinging the display open to the left like a book.",
          tip: "CRITICAL: The display ribbon cables are on the left side. Never pull the screen straight up!"
        },
        {
          num: 5,
          title: "Disconnect Battery Connector First",
          desc: "Remove the battery connector cover bracket using the Tri-point Y000 screwdriver. Use a plastic spudger to pry the battery terminal connector straight off the logic board.",
          tip: "Always disconnect power before touching any other ribbon connector."
        },
        {
          num: 6,
          title: "Extract Pull Tabs & Seat Fresh Battery",
          desc: "Gently peel the white pull tabs at the top and bottom of the battery. Pull them flat and parallel to the chassis without snapping. Clean adhesive residue with 99% IPA, lay fresh adhesive strips, and seat the new battery.",
          tip: "If a pull tab snaps, apply 3 drops of 99% IPA around the battery edge to dissolve the glue."
        }
      ]
    },
    {
      id: "guide-thinkpad-repaste",
      title: "ThinkPad T480 / T14 Dual Heatpipe Repaste & Keyboard Module Replacement",
      device: "Lenovo ThinkPad T480 / T14",
      category: "laptop",
      difficulty: "Beginner",
      timeEstimate: "25 mins",
      repairabilityScore: 9.4,
      badge: "Open Hardware Spec",
      tools: ["Phillips #1 Screwdriver", "Plastic Spudger", "Lint-free Microfiber Cloth", "99% Isopropyl Alcohol", "Non-conductive Thermal Paste (e.g. Arctic MX-4 or Noctua NT-H1)"],
      parts: ["High-grade thermal compound (1g)", "Compressed air canister (or manual blower)"],
      safetyWarning: "Ensure Internal Battery is disabled in UEFI BIOS before opening chassis: Restart -> Enter BIOS -> Config -> Power -> Disable Built-in Battery.",
      steps: [
        {
          num: 1,
          title: "Disable Internal Battery in BIOS & Remove External Pack",
          desc: "Slide the dual latches to eject the external 24Wh/72Wh rear battery. Boot to BIOS and execute 'Disable Built-in Battery' to cut 11.4V DC rail power safely.",
          tip: "The internal battery re-enables automatically once the AC charger is plugged in."
        },
        {
          num: 2,
          title: "Loosen Captive Bottom Cover Screws",
          desc: "Loosen the 6 captive Phillips screws on the base. Because they are captive, they will remain safely attached to the bottom plate so you can't lose them.",
          tip: "Start unhooking the perimeter clips near the RJ45 ethernet port."
        },
        {
          num: 3,
          title: "Unhook Copper Heatsink (Reverse Number Sequence)",
          desc: "Unthread heatsink screws in reverse numerical order (4 -> 3 -> 2 -> 1) to relieve mechanical tension evenly across the bare silicon die.",
          tip: "Gently twist the copper pipe before lifting to break the crusty old thermal paste bond."
        },
        {
          num: 4,
          title: "Clean Die & Apply Fresh Thermal Paste",
          desc: "Soak a lint-free cloth with 99% IPA and wipe old dried thermal paste off the Intel CPU and heatsink copper pad until mirror shiny. Apply a single pea-sized dot of fresh non-conductive paste in the center.",
          tip: "Never spread paste with bare fingers; skin oils create thermal micro-voids."
        },
        {
          num: 5,
          title: "Re-torque in Sequence (1 -> 2 -> 3 -> 4)",
          desc: "Reseat the heatsink flat. Tighten screws in ascending numerical order (1 -> 2 -> 3 -> 4) to ensure uniform mounting pressure and optimal 15-20°C temperature drops under heavy load.",
          tip: "Snap base cover back into place and reconnect AC power."
        }
      ]
    },
    {
      id: "guide-ipad9-digitizer",
      title: "Apple iPad (7th–9th Gen) Glass Digitizer Separation & Display Preservation",
      device: "Apple iPad 9th Gen",
      category: "tablet",
      difficulty: "Advanced",
      timeEstimate: "70 mins",
      repairabilityScore: 5.0,
      badge: "Specialized Teardown",
      tools: ["Adjustable Heat Gun (75°C)", "Opening Picks (6-8 pack)", "Heavy-duty Suction Cup", "Phillips #00 Screwdriver", "B-7000 or Tesa 61395 Tape", "Pre-cut Digitizer Bezel Tape"],
      parts: ["OEM-Spec 10.2-inch Glass Digitizer with Home Button Bracket", "Dust-isolation Foam Gasket"],
      safetyWarning: "WARNING: Work over an ESD safe mat. Wear eye protection when handling shattered front glass shards. The LCD panel beneath is fragile and easily scratched.",
      steps: [
        {
          num: 1,
          title: "Tape Over Fractured Glass",
          desc: "Cover the entire front glass with clear packing tape. This ensures the suction cup can seal and prevents glass splinters from penetrating into the LCD backlight.",
          tip: "Press the tape firmly using a squeegee or plastic card."
        },
        {
          num: 2,
          title: "Circumferential Heat Application (75°C)",
          desc: "Heat the perimeter border for 3-4 minutes. Keep the heat gun moving constantly to avoid burning the LCD diffuser layers underneath.",
          tip: "Target surface temperature of 75°C—hot to the touch, but not scorching."
        },
        {
          num: 3,
          title: "Insert Picks & Avoid Lower Right Cable Zone",
          desc: "Insert picks to slice the sticky adhesive tape. DANGER: The digitizer flex cables are located along the lower right quadrant. Do not insert picks deeper than 2mm along the bottom edge!",
          tip: "Keep multiple picks stationed around corners so adhesive doesn't re-tack."
        },
        {
          num: 4,
          title: "Hinge Digitizer Open & Unscrew LCD",
          desc: "Once adhesive is freed, hinge the digitizer over to the right. Unscrew the 4 corner Phillips screws holding the pristine LCD display in place.",
          tip: "Lift LCD gently from top edge and tilt upwards."
        },
        {
          num: 5,
          title: "Disconnect Battery with Isolation Card",
          desc: "Slide a thin plastic battery blocker under the logic board battery contact screw before unclipping the display cables to prevent blown backlight filters.",
          tip: "A blown backlight filter causes a dim screen requiring microsoldering."
        },
        {
          num: 6,
          title: "Transfer Original Home Button (Preserve Touch ID)",
          desc: "Heat the home button bracket from beneath and carefully peel the original home button flex cable to transfer to the new glass. Only the original home button retains Touch ID biometric pairing!",
          tip: "Never cut or tear the serpentine home button trace."
        }
      ]
    },
    {
      id: "guide-framework-modular-io",
      title: "Framework Laptop 13 Modular Expansion Card & Battery Diagnostic",
      device: "Framework Laptop 13",
      category: "laptop",
      difficulty: "Beginner",
      timeEstimate: "15 mins",
      repairabilityScore: 10.0,
      badge: "Official Modular Architecture",
      tools: ["Included Framework T5 Torx / Spudger Tool"],
      parts: ["Framework USB-C / HDMI / Storage Expansion Card", "Replacement 61Wh battery (if degraded)"],
      safetyWarning: "Turn off device and disconnect external power adapter before releasing internal magnetic bezel fasteners.",
      steps: [
        {
          num: 1,
          title: "Slide Expansion Release Catch",
          desc: "Press the mechanical release button located on the bottom chassis to hot-eject faulty expansion cards without unthreading a single screw.",
          tip: "Each of the 4 slots connects directly to PCIe / USB4 high-speed lanes."
        },
        {
          num: 2,
          title: "Loosen 5 Fasteners on Bottom Cover",
          desc: "Using the Framework screwdriver, loosen 5 captive fasteners. The bottom right fastener pushes the keyboard deck up slightly for effortless access.",
          tip: "Zero adhesive or glued clips are used anywhere in the chassis."
        },
        {
          num: 3,
          title: "Lift Keyboard Deck with Zero Friction",
          desc: "Lift the magnetic keyboard assembly upwards to expose the full logic board, dual DDR5 SO-DIMM slots, and battery connector.",
          tip: "Scan any QR code stamped on internal components to open official schematics."
        },
        {
          num: 4,
          title: "Inspect / Replace Battery or Modded Port",
          desc: "Unplug the keyed battery harness and unthread 3 captive fasteners to replace the battery cell in under 90 seconds.",
          tip: "All parts are 100% recyclable aluminum and post-consumer recycled plastics."
        }
      ]
    }
  ],

  repairDirectory: [
    {
      id: "shop-apex",
      name: "Apex Electronics Lab",
      city: "Central Tech District",
      distance: "2.4 miles",
      specialty: ["Logic Board Microsoldering", "Apple Component Triage", "Cleanroom Screen Swaps"],
      certifications: ["IPC-7711/7721 Certified", "Right to Repair Coalition Member"],
      turnaround: "24-48 hours",
      rating: 4.9,
      reviewCount: 142,
      pricingLevel: "Transparent / By Estimate",
      indicativePricing: "Screen: $65-$120 · Battery: $45-$75 · Board Diagnostics: $40",
      verified: true,
      phone: "+1 (555) 382-9011",
      email: "triage@apexelectronicslab.demo",
      bio: "Equipped with stereo inspection microscopes, hot air rework stations, and ultrasonic cleaning baths. We specialize in component-level repair rather than wasteful full-board swaps."
    },
    {
      id: "shop-circuitcraft",
      name: "CircuitCraft Micro-Repairs",
      city: "Northside Maker Quarter",
      distance: "4.1 miles",
      specialty: ["ThinkPad & Dell Specialist", "Thermal Optimization", "Data Recovery"],
      certifications: ["CompTIA A+ Master", "ESD Safe Facility 2026"],
      turnaround: "Same-Day / 24 hours",
      rating: 4.8,
      reviewCount: 98,
      pricingLevel: "Fixed Labor Rates",
      indicativePricing: "Thermal Repaste: $35 · Keyboard Swap: $45 · Screen: $70 labor",
      verified: true,
      phone: "+1 (555) 492-3320",
      email: "service@circuitcraftrepairs.demo",
      bio: "Independent workstation and laptop revival shop. We stock extensive spare components for ThinkPads, Latitudes, and EliteBooks, championing circular hardware longevity."
    },
    {
      id: "shop-greenbyte",
      name: "GreenByte Modular Workshop",
      city: "Eastside Innovation Hub",
      distance: "5.8 miles",
      specialty: ["Framework Certified Partner", "Fairphone Repairs", "Linux Upgrades"],
      certifications: ["Open Hardware Certified", "e-Stewards Reuse Partner"],
      turnaround: "1-2 days",
      rating: 4.9,
      reviewCount: 215,
      pricingLevel: "Transparent Tiered",
      indicativePricing: "Modular Upgrades: $30 · Battery Refresh: $40 · Full Audit: $25",
      verified: true,
      phone: "+1 (555) 781-4402",
      email: "hello@greenbytemodular.demo",
      bio: "Dedicated solely to open-architecture and modular computing. We help customers source ethically mined materials, upgrade modular sockets, and convert old hardware to low-power home servers."
    },
    {
      id: "shop-urbansilicon",
      name: "Urban Silicon Revival Co-op",
      city: "West End Community Center",
      distance: "7.2 miles",
      specialty: ["Affordable Student Repairs", "Tablet Digitizers", "BYO Parts Welcome"],
      certifications: ["Community Repair Network", "Non-Profit Co-op"],
      turnaround: "2-3 days",
      rating: 4.7,
      reviewCount: 64,
      pricingLevel: "Subsidized / Sliding Scale",
      indicativePricing: "Diagnostic: Free · Guided DIY Bench: $15/hr · Labor: $30-$50",
      verified: false,
      phone: "+1 (555) 912-7740",
      email: "coop@urbansilicon.demo",
      bio: "Community-operated repair cafe and workshop. We offer free bench tools, multimeters, and soldering irons if you want to perform your own repair with technician supervision."
    },
    {
      id: "shop-northstar",
      name: "Northstar Precision Tech",
      city: "Southwest Tech Corridor",
      distance: "8.9 miles",
      specialty: ["Micro-soldering & BGA Reballing", "Water Damage Recovery", "Surface & iPad"],
      certifications: ["IPC Master Instructor", "Apple Independent Repair Provider"],
      turnaround: "2-4 days",
      rating: 4.8,
      reviewCount: 112,
      pricingLevel: "Commercial Grade",
      indicativePricing: "Water Damage Ultrasonic: $75 · BGA Chip Swap: $110",
      verified: true,
      phone: "+1 (555) 603-8821",
      email: "desk@northstartech.demo",
      bio: "High-precision laboratory handling complex liquid damage, damaged FPC connectors, broken charging ICs (Tristar/Hydra), and trace reconstruction under 45x magnification."
    },
    {
      id: "shop-zerowaste",
      name: "Zero-Waste Device Lab",
      city: "Metro Science Park",
      distance: "11.5 miles",
      specialty: ["Corporate Fleet Refurbishment", "Secure Data Sanitization", "E-Waste Salvage"],
      certifications: ["R2v3 Certified Downstream", "NIST 800-88 Compliant"],
      turnaround: "Bulk / 3-5 days",
      rating: 5.0,
      reviewCount: 83,
      pricingLevel: "Enterprise & Retail",
      indicativePricing: "NIST Drive Wipe: $20 · Fleet Triage: $35/unit",
      verified: true,
      phone: "+1 (555) 234-9912",
      email: "recovery@zerowastelab.demo",
      bio: "Specializing in lifecycle extension for corporate and educational fleets. If a device cannot be economically restored, we harvest its working SMD modules before responsible smelting."
    }
  ],

  sanitizationOS: [
    {
      id: "ios",
      name: "Apple iOS / iPadOS",
      steps: [
        { title: "Sign Out of iCloud & Apple ID", desc: "Open Settings -> [Your Name] -> Scroll to bottom -> Sign Out. Enter your Apple ID password to disable 'Find My' activation lock. Failing to do this bricks the phone for secondary users." },
        { title: "Unpair Apple Watch & Bluetooth", desc: "Unpair wearable devices to trigger an automatic health/data backup to iCloud." },
        { title: "Perform Cryptographic Wipe", desc: "Settings -> General -> Transfer or Reset iPhone -> Erase All Content and Settings. This purges the hardware AES-256 encryption keys instantly, rendering previous flash blocks mathematically unrecoverable." },
        { title: "Remove SIM / eSIM profile", desc: "Eject physical nano-SIM tray or delete cellular eSIM profiles from Settings." }
      ]
    },
    {
      id: "android",
      name: "Google Android",
      steps: [
        { title: "Remove Google Accounts (Disable FRP)", desc: "CRITICAL: Go to Settings -> Accounts & Backup -> Manage Accounts -> Tap each Google account -> 'Remove Account'. If not done, Factory Reset Protection (FRP) locks out future users!" },
        { title: "Verify Device Encryption", desc: "Modern Android 10+ devices are encrypted by default via File-Based Encryption (FBE). Verify under Settings -> Security & Privacy -> Encryption." },
        { title: "Execute Factory Data Reset", desc: "Settings -> System -> Reset Options -> Erase All Data (Factory Reset). Confirm PIN." },
        { title: "Remove MicroSD Card & SIM", desc: "Eject tray to retain external storage cards containing personal photos or offline documents." }
      ]
    },
    {
      id: "windows",
      name: "Microsoft Windows 10/11",
      steps: [
        { title: "Backup Personal Files & BitLocker Keys", desc: "Export crucial files to external drive. Unlink Microsoft OneDrive from taskbar settings." },
        { title: "De-authorize Software Licenses", desc: "Sign out of Adobe Creative Cloud, Steam, or specialized licensed CAD/engineering suites." },
        { title: "Execute 'Clean the Drive' Reset", desc: "Settings -> System -> Recovery -> Reset this PC -> Choose 'Remove everything' -> Choose 'Local reinstall' -> Under Additional settings, select 'Clean data: Yes'. This writes zero patterns over SSD blocks (NIST 800-88 Clear level)." },
        { title: "Check TPM Clearance", desc: "Ensure TPM (Trusted Platform Module) keys are cleared in UEFI BIOS so no cryptographic credentials persist." }
      ]
    },
    {
      id: "macos",
      name: "Apple macOS (Intel & Apple Silicon)",
      steps: [
        { title: "Sign Out of Apple ID & Turn off Find My Mac", desc: "System Settings -> Apple ID -> Sign Out. Turn off 'Find My Mac'." },
        { title: "De-authorize Apple Music / TV", desc: "Music app -> Account -> Authorizations -> De-authorize This Computer." },
        { title: "Erase All Content and Settings", desc: "macOS Monterey or newer: System Settings -> General -> Transfer or Reset -> Erase All Content and Settings. For older Intel Macs: Boot holding Command+R into Disk Utility -> Erase APFS volume -> Reinstall macOS." },
        { title: "Reset NVRAM / PRAM (Intel only)", desc: "For Intel Macs, reboot holding Option+Command+P+R for 20 seconds to purge local NVRAM configuration registers." }
      ]
    }
  ],

  dropOffLocations: [
    {
      name: "Metro Resource Recovery Facility (Certified R2v3)",
      address: "1040 Industrial Pkwy, Sector 4",
      distance: "3.2 miles",
      certification: "R2v3 Certified, ISO 14001",
      accepted: ["Smartphones", "Laptops", "Monitors", "Circuit Boards", "Lithium-Ion Batteries"],
      hours: "Mon-Sat: 08:00 - 17:00",
      phone: "+1 (555) 720-4100"
    },
    {
      name: "EcoDrop Civic Recycling Station",
      address: "245 Civic Center Blvd",
      distance: "5.1 miles",
      certification: "e-Stewards Certified",
      accepted: ["Personal Electronics", "Cables & Adapters", "Household Tablets"],
      hours: "Tue-Sun: 09:00 - 18:00",
      phone: "+1 (555) 890-2214"
    },
    {
      name: "Campus Maker-Space & Hardware Salvage Node",
      address: "Engineering Hall B, University Central",
      distance: "6.7 miles",
      certification: "CEDA-EPS Pilot Node",
      accepted: ["Functional & Non-functional Laptops", "Maker Parts", "Keyboards", "RAM"],
      hours: "Mon-Fri: 10:00 - 19:00",
      phone: "+1 (555) 302-8819"
    }
  ],

  impactFactors: {
    // Environmental Life Cycle Assessment (LCA) averages per unit (based on UN E-waste Monitor & Apple LCA reports)
    phone: {
      manufacturingCo2Kg: 65,
      repairCo2Kg: 4.5,
      ewasteGrams: 190,
      cobaltGrams: 12,
      lithiumGrams: 3.5,
      goldMg: 35,
      avgRepairSavingsUsd: 650
    },
    laptop: {
      manufacturingCo2Kg: 220,
      repairCo2Kg: 12.0,
      ewasteGrams: 1850,
      cobaltGrams: 45,
      lithiumGrams: 18,
      goldMg: 220,
      avgRepairSavingsUsd: 850
    },
    tablet: {
      manufacturingCo2Kg: 95,
      repairCo2Kg: 6.0,
      ewasteGrams: 480,
      cobaltGrams: 22,
      lithiumGrams: 7.0,
      goldMg: 75,
      avgRepairSavingsUsd: 320
    }
  }
};

window.CIRCULAR_DATA = CIRCULAR_DATA;
