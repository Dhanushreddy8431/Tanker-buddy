/**
 * Tanker Buddy — Bangalore's Traceable & Softened Water Infrastructure Platform
 * Application Core Controller & Interactive Operations Engine
 */

document.addEventListener("DOMContentLoaded", async function() {
  // Initialize Database
  await TankerDB.init();

  // App State
  const state = {
    currentSegment: "household", // "household" or "rwa"
    calculator: {
      volume: 4000,
      source: "borewell",
      treatment: "raw", // Default unsoftened baseline so 4,000L starts at ₹550
      isBulk: false
    },
    householdForm: {
      volume: 4000,
      source: "borewell",
      treatment: "raw", // Default unsoftened baseline
      hoseLength: "<30 ft",
      frequency: "Immediate One-Time",
      sensorRequested: false
    },
    rwaForm: {
      volume: 40000,
      source: "cauvery",
      treatment: "softened",
      deliveryWindow: "04:00 AM - 07:00 AM",
      sensorRequested: true
    },
    sumpSimulator: {
      capacity: 10000,
      levelPercent: 65
    },
    admin: {
      isAuthenticated: sessionStorage.getItem("tb_admin_auth") === "true",
      searchQuery: "",
      clusterFilter: "all",
      statusFilter: "all"
    },
    driver: {
      isAuthenticated: sessionStorage.getItem("tb_driver_auth") === "true",
      activeProfileId: localStorage.getItem("tb_active_driver_id") || "DRV-5301",
      currentTab: "available",
      gps: {
        lat: "12.9716",
        lng: "77.5946",
        accuracy: 8,
        timestamp: new Date().toLocaleTimeString("en-IN")
      }
    }
  };

  // Toast Notification System
  function showToast(message, type = "success", duration = 4000) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === "success") {
      iconSvg = `<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
    } else if (type === "error") {
      iconSvg = `<svg class="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
    } else {
      iconSvg = `<svg class="w-5 h-5 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    }

    toast.innerHTML = `
      <div class="flex items-center gap-3">
        ${iconSvg}
        <span class="text-slate-100 font-medium text-sm">${message}</span>
      </div>
      <button class="text-slate-400 hover:text-slate-100 p-1" onclick="this.parentElement.remove()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  window.showToast = showToast;

  // Pricing Calculation Function
  function calculateBill(volumeLiters, sourceId, treatmentId, isBulk = false) {
    const p = TANKER_BUDDY_DATA.pricingEngine;
    let basePrice = 0;

    if (isBulk || volumeLiters > 12000) {
      basePrice = (volumeLiters / 1000) * p.bulkRatePer1000L;
    } else {
      const volObj = p.volumes.find(v => parseInt(v.id) === volumeLiters);
      if (volObj) {
        basePrice = volObj.basePrice;
      } else {
        // Fallback interpolation for unsoftened baseline
        if (volumeLiters <= 4000) basePrice = 550;
        else if (volumeLiters <= 6000) basePrice = 650;
        else if (volumeLiters <= 8000) basePrice = 850;
        else if (volumeLiters <= 10000) basePrice = 1050;
        else if (volumeLiters <= 12000) basePrice = 1250;
        else basePrice = (volumeLiters / 1000) * p.bulkRatePer1000L;
      }
    }

    const sourceObj = p.sources.find(s => s.id === sourceId) || p.sources[0];
    const sourceSurcharge = sourceObj.surcharge;

    const treatmentObj = p.treatments.find(t => t.id === treatmentId) || p.treatments[0];
    const treatmentSurcharge = treatmentObj.surcharge;

    const transitFee = p.logisticsFee; // Fixed ₹50
    const subtotal = basePrice + sourceSurcharge + treatmentSurcharge + transitFee;
    const gst = Math.round(subtotal * p.gstRate);
    const total = subtotal + gst;

    // Cartel comparison calculation
    let cartelEstimate = (volumeLiters / 6000) * p.summerSurgeCartelAverage;
    if (cartelEstimate < 1200) cartelEstimate = 1200;
    const estimatedSavings = Math.max(0, Math.round(cartelEstimate - total));

    return {
      volumeLiters,
      basePrice,
      sourceObj,
      sourceSurcharge,
      treatmentObj,
      treatmentSurcharge,
      transitFee,
      subtotal,
      gst,
      total,
      cartelEstimate: Math.round(cartelEstimate),
      estimatedSavings
    };
  }

  // 1. Segment Switcher ("household" vs "rwa")
  function setSegment(segment) {
    state.currentSegment = segment;
    const btnHousehold = document.getElementById("seg-btn-household");
    const btnRwa = document.getElementById("seg-btn-rwa");
    const rwaBadge = document.getElementById("hero-rwa-badge");
    const householdBadge = document.getElementById("hero-household-badge");
    const householdTabBtn = document.getElementById("tab-household-btn");
    const rwaTabBtn = document.getElementById("tab-rwa-btn");

    if (segment === "rwa") {
      btnRwa?.classList.add("bg-sky-600", "text-white", "shadow-lg");
      btnRwa?.classList.remove("text-slate-300");
      btnHousehold?.classList.remove("bg-sky-600", "text-white", "shadow-lg");
      btnHousehold?.classList.add("text-slate-300");

      rwaBadge?.classList.remove("hidden");
      householdBadge?.classList.add("hidden");

      // Switch booking form tab
      switchBookingTab("rwa");
    } else {
      btnHousehold?.classList.add("bg-sky-600", "text-white", "shadow-lg");
      btnHousehold?.classList.remove("text-slate-300");
      btnRwa?.classList.remove("bg-sky-600", "text-white", "shadow-lg");
      btnRwa?.classList.add("text-slate-300");

      householdBadge?.classList.remove("hidden");
      rwaBadge?.classList.add("hidden");

      // Switch booking form tab
      switchBookingTab("household");
    }
  }

  // Segment Buttons Click Listeners
  document.getElementById("seg-btn-household")?.addEventListener("click", () => setSegment("household"));
  document.getElementById("seg-btn-rwa")?.addEventListener("click", () => setSegment("rwa"));

  // 2. Booking Engine Tabs
  function switchBookingTab(tab) {
    const tabHouseholdBtn = document.getElementById("tab-household-btn");
    const tabRwaBtn = document.getElementById("tab-rwa-btn");
    const paneHousehold = document.getElementById("pane-household");
    const paneRwa = document.getElementById("pane-rwa");

    if (tab === "rwa") {
      tabRwaBtn?.classList.add("border-sky-500", "text-sky-400", "bg-slate-800/80");
      tabRwaBtn?.classList.remove("border-transparent", "text-slate-400");
      tabHouseholdBtn?.classList.remove("border-sky-500", "text-sky-400", "bg-slate-800/80");
      tabHouseholdBtn?.classList.add("border-transparent", "text-slate-400");

      paneRwa?.classList.remove("hidden");
      paneHousehold?.classList.add("hidden");
      updateRwaSummary();
    } else {
      tabHouseholdBtn?.classList.add("border-sky-500", "text-sky-400", "bg-slate-800/80");
      tabHouseholdBtn?.classList.remove("border-transparent", "text-slate-400");
      tabRwaBtn?.classList.remove("border-sky-500", "text-sky-400", "bg-slate-800/80");
      tabRwaBtn?.classList.add("border-transparent", "text-slate-400");

      paneHousehold?.classList.remove("hidden");
      paneRwa?.classList.add("hidden");
      updateHouseholdSummary();
    }
  }

  document.getElementById("tab-household-btn")?.addEventListener("click", () => switchBookingTab("household"));
  document.getElementById("tab-rwa-btn")?.addEventListener("click", () => switchBookingTab("rwa"));

  // 3. Household On-Demand Booking Form Interactivity
  function setupHouseholdForm() {
    // Volume selector buttons
    const volButtons = document.querySelectorAll(".household-vol-btn");
    volButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        volButtons.forEach(b => {
          b.classList.remove("selected", "border-sky-500", "bg-sky-950/40");
          b.classList.add("border-slate-700");
        });
        btn.classList.add("selected", "border-sky-500", "bg-sky-950/40");
        state.householdForm.volume = parseInt(btn.dataset.volume);
        updateHouseholdSummary();
      });
    });

    // Source radio cards
    const sourceCards = document.querySelectorAll(".household-source-card");
    sourceCards.forEach(card => {
      card.addEventListener("click", () => {
        sourceCards.forEach(c => {
          c.classList.remove("selected", "border-sky-500", "bg-sky-950/40");
          c.classList.add("border-slate-700");
        });
        card.classList.add("selected", "border-sky-500", "bg-sky-950/40");
        state.householdForm.source = card.dataset.source;
        updateHouseholdSummary();
      });
    });

    // Treatment radio cards
    const treatmentCards = document.querySelectorAll(".household-treatment-card");
    treatmentCards.forEach(card => {
      card.addEventListener("click", () => {
        treatmentCards.forEach(c => {
          c.classList.remove("selected", "border-sky-500", "bg-sky-950/40");
          c.classList.add("border-slate-700");
        });
        card.classList.add("selected", "border-sky-500", "bg-sky-950/40");
        state.householdForm.treatment = card.dataset.treatment;
        updateHouseholdSummary();
      });
    });

    // Hose Length
    document.getElementById("household-hose")?.addEventListener("change", (e) => {
      state.householdForm.hoseLength = e.target.value;
    });

    // Frequency
    document.getElementById("household-freq")?.addEventListener("change", (e) => {
      state.householdForm.frequency = e.target.value;
      updateHouseholdSummary();
    });

    // Sensor Toggle
    document.getElementById("household-sensor-toggle")?.addEventListener("change", (e) => {
      state.householdForm.sensorRequested = e.target.checked;
    });

    // Collapsible Bill Toggle
    const toggleBillBtn = document.getElementById("toggle-bill-details");
    const billDetailsEl = document.getElementById("bill-details-content");
    const billChevron = document.getElementById("bill-chevron");

    toggleBillBtn?.addEventListener("click", () => {
      const isOpen = billDetailsEl.classList.contains("open");
      if (isOpen) {
        billDetailsEl.classList.remove("open");
        billChevron.classList.remove("rotate-180");
      } else {
        billDetailsEl.classList.add("open");
        billChevron.classList.add("rotate-180");
      }
    });

    // Delivery Date default to today
    const deliveryDateInput = document.getElementById("household-delivery-date");
    if (deliveryDateInput && !deliveryDateInput.value) {
      deliveryDateInput.value = new Date().toISOString().slice(0, 10);
      deliveryDateInput.min = new Date().toISOString().slice(0, 10);
    }

    // Form Submit
    document.getElementById("household-order-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const name = form.residentName.value.trim();
      const phone = form.phone.value.trim();
      const cluster = form.cluster.value;
      const address = form.address.value.trim();
      const deliveryDate = form.deliveryDate?.value || new Date().toISOString().slice(0, 10);
      const notes = form.notes.value.trim();

      // Indian 10-digit mobile validation
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
        showToast("Please enter a valid 10-digit Indian mobile number.", "error");
        form.phone.focus();
        return;
      }

      if (!name || !cluster || !address) {
        showToast("Please fill in all required fields (Name, Cluster, Address).", "error");
        return;
      }

      const bill = calculateBill(state.householdForm.volume, state.householdForm.source, state.householdForm.treatment, false);

      const leadData = {
        customerType: "Household",
        customerName: name,
        representativeName: name,
        phone: phone.replace(/\D/g, ""),
        email: form.email?.value.trim() || "",
        cluster: cluster,
        address: address,
        volumeLiters: state.householdForm.volume,
        volumeLabel: `${state.householdForm.volume.toLocaleString("en-IN")} Liters`,
        source: state.householdForm.source,
        sourceLabel: bill.sourceObj.name,
        treatment: state.householdForm.treatment,
        treatmentLabel: bill.treatmentObj.name,
        frequency: state.householdForm.frequency,
        deliveryDate: deliveryDate,
        deliveryWindow: `${deliveryDate} • Immediate Priority (Within 90 mins)`,
        hoseLength: state.householdForm.hoseLength,
        sensorRequested: state.householdForm.sensorRequested,
        estimatedPrice: bill.total,
        status: "New Lead",
        timestamp: new Date().toISOString(),
        notes: notes,
        billBreakdown: bill
      };

      try {
        const saved = await TankerDB.saveLead(leadData);
        showToast(`Order Queued! Reference ID: ${saved.id}`, "success");
        form.reset();
        if (deliveryDateInput) deliveryDateInput.value = new Date().toISOString().slice(0, 10);
        openReceiptModal(saved, bill);
      } catch (err) {
        console.error(err);
        showToast("Failed to save booking. Please try again.", "error");
      }
    });
  }

  // Update Household Collapsible Bill Summary
  function updateHouseholdSummary() {
    const bill = calculateBill(state.householdForm.volume, state.householdForm.source, state.householdForm.treatment, false);

    // Update Elements
    const totalEl = document.getElementById("bill-total-price");
    const subtotalEl = document.getElementById("bill-subtotal");
    const gstEl = document.getElementById("bill-gst");
    const basePriceEl = document.getElementById("bill-base-price");
    const sourcePriceEl = document.getElementById("bill-source-price");
    const treatmentPriceEl = document.getElementById("bill-treatment-price");
    const transitFeeEl = document.getElementById("bill-transit-fee");
    const savingsEl = document.getElementById("bill-savings-amount");
    const baseVolLabelEl = document.getElementById("bill-vol-label");
    const sourceLabelEl = document.getElementById("bill-source-label");
    const treatmentLabelEl = document.getElementById("bill-treatment-label");

    if (totalEl) totalEl.textContent = `₹${bill.total.toLocaleString("en-IN")}`;
    if (subtotalEl) subtotalEl.textContent = `₹${bill.subtotal.toLocaleString("en-IN")}`;
    if (gstEl) gstEl.textContent = `₹${bill.gst.toLocaleString("en-IN")}`;
    if (basePriceEl) basePriceEl.textContent = `₹${bill.basePrice.toLocaleString("en-IN")}`;
    if (sourcePriceEl) sourcePriceEl.textContent = `+₹${bill.sourceSurcharge.toLocaleString("en-IN")}`;
    if (treatmentPriceEl) treatmentPriceEl.textContent = `+₹${bill.treatmentSurcharge.toLocaleString("en-IN")}`;
    if (transitFeeEl) transitFeeEl.textContent = `₹${bill.transitFee.toLocaleString("en-IN")}`;
    if (savingsEl) savingsEl.textContent = `₹${bill.estimatedSavings.toLocaleString("en-IN")}`;
    
    if (baseVolLabelEl) baseVolLabelEl.textContent = `${bill.volumeLiters.toLocaleString("en-IN")}L Base Delivery (Without Soften)`;
    if (sourceLabelEl) sourceLabelEl.textContent = bill.sourceObj.name;
    if (treatmentLabelEl) treatmentLabelEl.textContent = bill.treatmentObj.name;
  }

  // 4. RWA Bulk Contract Inquiry Form
  function setupRwaForm() {
    const slider = document.getElementById("rwa-liters-slider");
    const displayVal = document.getElementById("rwa-liters-val");

    slider?.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      state.rwaForm.volume = val;
      if (displayVal) displayVal.textContent = `${val.toLocaleString("en-IN")} Liters / Day`;
      updateRwaSummary();
    });

    // Quick volume presets
    document.querySelectorAll(".rwa-preset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const val = parseInt(btn.dataset.volume);
        state.rwaForm.volume = val;
        if (slider) slider.value = val;
        if (displayVal) displayVal.textContent = `${val.toLocaleString("en-IN")} Liters / Day`;
        updateRwaSummary();
      });
    });

    // Source
    document.getElementById("rwa-source")?.addEventListener("change", (e) => {
      state.rwaForm.source = e.target.value;
      updateRwaSummary();
    });

    // Treatment
    document.getElementById("rwa-treatment")?.addEventListener("change", (e) => {
      state.rwaForm.treatment = e.target.value;
      updateRwaSummary();
    });

    // Window
    document.getElementById("rwa-corridor-window")?.addEventListener("change", (e) => {
      state.rwaForm.deliveryWindow = e.target.value;
    });

    // Sensor Checkbox
    document.getElementById("rwa-sensor-checkbox")?.addEventListener("change", (e) => {
      state.rwaForm.sensorRequested = e.target.checked;
    });

    // Contract Start Date default to today
    const rwaStartDateInput = document.getElementById("rwa-start-date");
    if (rwaStartDateInput && !rwaStartDateInput.value) {
      rwaStartDateInput.value = new Date().toISOString().slice(0, 10);
      rwaStartDateInput.min = new Date().toISOString().slice(0, 10);
    }

    // Submit
    document.getElementById("rwa-inquiry-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const societyName = form.societyName.value.trim();
      const contactPerson = form.contactPerson.value.trim();
      const phone = form.phone.value.trim();
      const email = form.email.value.trim();
      const cluster = form.cluster.value;
      const flatsCount = form.flatsCount.value;
      const sumpCapacity = form.sumpCapacity.value;
      const startDate = form.startDate?.value || new Date().toISOString().slice(0, 10);
      const notes = form.notes.value.trim();

      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
        showToast("Please enter a valid 10-digit Indian WhatsApp number.", "error");
        form.phone.focus();
        return;
      }

      if (!societyName || !contactPerson || !cluster) {
        showToast("Please fill in Society Name, Secretary/Estate Head, and Cluster.", "error");
        return;
      }

      const bill = calculateBill(state.rwaForm.volume, state.rwaForm.source, state.rwaForm.treatment, true);

      const leadData = {
        customerType: "RWA",
        customerName: societyName,
        representativeName: contactPerson,
        phone: phone.replace(/\D/g, ""),
        email: email,
        cluster: cluster,
        address: `${societyName}, ${form.cluster.options[form.cluster.selectedIndex].text}, Bengaluru (${flatsCount} Units, Sump: ${sumpCapacity}L)`,
        volumeLiters: state.rwaForm.volume,
        volumeLabel: `${state.rwaForm.volume.toLocaleString("en-IN")} Liters / Day (RWA Bulk Contract)`,
        source: state.rwaForm.source,
        sourceLabel: bill.sourceObj.name,
        treatment: state.rwaForm.treatment,
        treatmentLabel: bill.treatmentObj.name,
        frequency: "Daily Bulk Contract",
        deliveryDate: startDate,
        deliveryWindow: `Start: ${startDate} • ${state.rwaForm.deliveryWindow}`,
        hoseLength: "<30 ft (Dedicated Sump Corridors)",
        sensorRequested: state.rwaForm.sensorRequested,
        estimatedPrice: bill.total,
        status: "New Lead",
        timestamp: new Date().toISOString(),
        notes: `Flats: ${flatsCount} units. Sump: ${sumpCapacity}L. Start Date: ${startDate}. Delivery Window: ${state.rwaForm.deliveryWindow}. Notes: ${notes}`,
        billBreakdown: bill
      };

      try {
        const saved = await TankerDB.saveLead(leadData);
        showToast(`RWA Contract Proposal Queued! Ref: ${saved.id}`, "success");
        form.reset();
        if (rwaStartDateInput) rwaStartDateInput.value = new Date().toISOString().slice(0, 10);
        openReceiptModal(saved, bill);
      } catch (err) {
        console.error(err);
        showToast("Error saving contract inquiry.", "error");
      }
    });
  }

  function updateRwaSummary() {
    const bill = calculateBill(state.rwaForm.volume, state.rwaForm.source, state.rwaForm.treatment, true);
    const dailyPriceEl = document.getElementById("rwa-daily-price");
    const monthlyPriceEl = document.getElementById("rwa-monthly-price");
    const ratePer1000El = document.getElementById("rwa-rate-per-1000");
    const savingsEl = document.getElementById("rwa-bulk-savings");

    if (dailyPriceEl) dailyPriceEl.textContent = `₹${bill.total.toLocaleString("en-IN")} / day`;
    if (monthlyPriceEl) {
      const monthly = bill.total * 30;
      monthlyPriceEl.textContent = `₹${monthly.toLocaleString("en-IN")} / month (30-day term)`;
    }
    if (ratePer1000El) {
      ratePer1000El.textContent = `₹${TANKER_BUDDY_DATA.pricingEngine.bulkRatePer1000L} / 1,000L`;
    }
    if (savingsEl) {
      const monthlySavings = bill.estimatedSavings * 30;
      savingsEl.textContent = `₹${monthlySavings.toLocaleString("en-IN")}`;
    }
  }

  // 5. Standalone Interactive Pricing Calculator Section
  function setupPricingCalculatorSection() {
    const volSlider = document.getElementById("calc-volume-slider");
    const volDisplay = document.getElementById("calc-volume-display");
    const sourceSelect = document.getElementById("calc-source-select");
    const treatmentSelect = document.getElementById("calc-treatment-select");

    function recalc() {
      const vol = parseInt(volSlider.value);
      state.calculator.volume = vol;
      state.calculator.source = sourceSelect.value;
      state.calculator.treatment = treatmentSelect.value;
      const isBulk = vol > 12000;

      const bill = calculateBill(vol, state.calculator.source, state.calculator.treatment, isBulk);

      if (volDisplay) volDisplay.textContent = `${vol.toLocaleString("en-IN")} Liters`;
      
      document.getElementById("calc-out-base").textContent = `₹${bill.basePrice.toLocaleString("en-IN")}`;
      document.getElementById("calc-out-source").textContent = `+₹${bill.sourceSurcharge.toLocaleString("en-IN")}`;
      document.getElementById("calc-out-treatment").textContent = `+₹${bill.treatmentSurcharge.toLocaleString("en-IN")}`;
      document.getElementById("calc-out-transit").textContent = `₹${bill.transitFee.toLocaleString("en-IN")}`;
      document.getElementById("calc-out-gst").textContent = `₹${bill.gst.toLocaleString("en-IN")}`;
      document.getElementById("calc-out-total").textContent = `₹${bill.total.toLocaleString("en-IN")}`;
      document.getElementById("calc-out-savings").textContent = `₹${bill.estimatedSavings.toLocaleString("en-IN")}`;

      const cartelEl = document.getElementById("calc-cartel-benchmark");
      if (cartelEl) cartelEl.textContent = `₹${bill.cartelEstimate.toLocaleString("en-IN")}`;
    }

    volSlider?.addEventListener("input", recalc);
    sourceSelect?.addEventListener("change", recalc);
    treatmentSelect?.addEventListener("change", recalc);

    // Calculator Preset Buttons
    document.querySelectorAll(".calc-preset-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const vol = parseInt(chip.dataset.volume);
        volSlider.value = vol;
        recalc();
      });
    });

    // "Apply to Booking Form" CTA
    document.getElementById("calc-apply-cta")?.addEventListener("click", () => {
      const vol = parseInt(volSlider.value);
      if (vol <= 12000) {
        setSegment("household");
        state.householdForm.volume = vol;
        state.householdForm.source = sourceSelect.value;
        state.householdForm.treatment = treatmentSelect.value;

        // update active classes on household buttons
        document.querySelectorAll(".household-vol-btn").forEach(btn => {
          if (parseInt(btn.dataset.volume) === vol) {
            btn.click();
          }
        });
      } else {
        setSegment("rwa");
        state.rwaForm.volume = vol;
        state.rwaForm.source = sourceSelect.value;
        state.rwaForm.treatment = treatmentSelect.value;
        const rwaSlider = document.getElementById("rwa-liters-slider");
        if (rwaSlider) {
          rwaSlider.value = vol;
          rwaSlider.dispatchEvent(new Event("input"));
        }
      }

      document.getElementById("booking-engine")?.scrollIntoView({ behavior: "smooth" });
      showToast("Applied calculated volume & grade to booking form!", "info");
    });

    recalc();
  }

  // 6. Smart Sump Auto-Refill (IoT Integration Feature) Simulator
  function setupSumpSimulator() {
    const slider = document.getElementById("sump-level-slider");
    const levelDisplay = document.getElementById("sump-level-display");
    const liquidFill = document.getElementById("sump-liquid-fill");
    const statusBadge = document.getElementById("sump-status-badge");
    const dispatchAlert = document.getElementById("sump-dispatch-alert");
    const litersDisplay = document.getElementById("sump-remaining-liters");
    const timeDisplay = document.getElementById("sump-time-remaining");

    function updateSump(level) {
      state.sumpSimulator.levelPercent = level;
      if (levelDisplay) levelDisplay.textContent = `${level}%`;
      if (liquidFill) liquidFill.style.height = `${level}%`;

      const remainingLiters = Math.round((level / 100) * state.sumpSimulator.capacity);
      if (litersDisplay) litersDisplay.textContent = `${remainingLiters.toLocaleString("en-IN")} L`;

      // Approximate consumption at 400L/hour for 24-flat building
      const hoursRemaining = (remainingLiters / 400).toFixed(1);
      if (timeDisplay) timeDisplay.textContent = `${hoursRemaining} hrs to dry`;

      if (level < 25) {
        // Critical Trigger state
        if (liquidFill) {
          liquidFill.style.backgroundColor = "rgba(239, 68, 68, 0.75)";
          liquidFill.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.6)";
        }
        if (statusBadge) {
          statusBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950 text-red-300 border border-red-700 live-pulse">
            <span class="w-2 h-2 rounded-full bg-red-500"></span> AUTO-DISPATCH TRIGGERED (<25%)
          </span>`;
        }
        if (dispatchAlert) {
          dispatchAlert.classList.remove("hidden");
          dispatchAlert.innerHTML = `
            <div class="flex items-start gap-3 p-3 bg-red-950/80 border border-red-700/80 rounded-lg text-xs text-red-200">
              <svg class="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <div>
                <p class="font-bold text-red-100">Dry Pump Protection Triggered!</p>
                <p class="mt-0.5">Sump breached 25% low threshold. Dedicated 10,000L corridor tanker auto-dispatched from nearest hub. Prevents dry running of lift pumps and morning water outage.</p>
              </div>
            </div>
          `;
        }
      } else if (level < 50) {
        // Cautionary state
        if (liquidFill) {
          liquidFill.style.backgroundColor = "rgba(245, 158, 11, 0.75)";
          liquidFill.style.boxShadow = "0 0 15px rgba(245, 158, 11, 0.4)";
        }
        if (statusBadge) {
          statusBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-700">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span> ADVISORY LEVEL (25% - 50%)
          </span>`;
        }
        if (dispatchAlert) dispatchAlert.classList.add("hidden");
      } else {
        // Optimal state
        if (liquidFill) {
          liquidFill.style.backgroundColor = "rgba(2, 132, 199, 0.75)";
          liquidFill.style.boxShadow = "0 0 20px rgba(14, 165, 233, 0.4)";
        }
        if (statusBadge) {
          statusBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span> NORMAL TELEMETRY (>50%)
          </span>`;
        }
        if (dispatchAlert) dispatchAlert.classList.add("hidden");
      }
    }

    slider?.addEventListener("input", (e) => {
      updateSump(parseInt(e.target.value));
    });

    // Preset quick simulation buttons
    document.querySelectorAll(".sump-sim-preset").forEach(btn => {
      btn.addEventListener("click", () => {
        const lvl = parseInt(btn.dataset.level);
        if (slider) slider.value = lvl;
        updateSump(lvl);
      });
    });

    // "Request Free Sensor Demo" CTA within Sump Section
    document.getElementById("sump-request-sensor-cta")?.addEventListener("click", () => {
      const cb1 = document.getElementById("household-sensor-toggle");
      const cb2 = document.getElementById("rwa-sensor-checkbox");
      if (cb1) cb1.checked = true;
      if (cb2) cb2.checked = true;
      state.householdForm.sensorRequested = true;
      state.rwaForm.sensorRequested = true;
      document.getElementById("booking-engine")?.scrollIntoView({ behavior: "smooth" });
      showToast("Ultrasonic Sump Sensor Demo request enabled in booking form!", "success");
    });

    updateSump(65);
  }

  // 7. Verified NABL Lab Reports Modal Viewer
  function setupLabReports() {
    const modal = document.getElementById("lab-modal");
    const modalContent = document.getElementById("lab-modal-content");
    const closeBtn = document.getElementById("lab-modal-close");

    function openLabReport(reportId) {
      const report = TANKER_BUDDY_DATA.labReports.find(r => r.id === reportId);
      if (!report || !modal || !modalContent) return;

      const rowsHtml = report.fullParameters.map((p, idx) => `
        <tr class="${idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-800/40'} border-b border-slate-700/60 text-xs">
          <td class="px-4 py-2.5 font-medium text-slate-200">${p.name}</td>
          <td class="px-4 py-2.5 font-mono-code font-bold text-sky-300">${p.testResult}</td>
          <td class="px-4 py-2.5 text-slate-400 font-mono-code">${p.unit}</td>
          <td class="px-4 py-2.5 text-slate-400">${p.bisLimit}</td>
          <td class="px-4 py-2.5 text-slate-400 hidden sm:table-cell">${p.method}</td>
          <td class="px-4 py-2.5">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700">
              ✓ ${p.status}
            </span>
          </td>
        </tr>
      `).join("");

      modalContent.innerHTML = `
        <div class="lab-report-sheet p-6 sm:p-8 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 shadow-2xl max-w-4xl w-full mx-auto">
          <!-- Lab Certificate Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700 pb-5 gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-sky-950 border border-sky-500 flex items-center justify-center text-sky-400 shrink-0">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  NABL-Accredited Water Quality Analysis Certificate
                  <span class="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 font-mono-code">NABL TC-8921</span>
                </h3>
                <p class="text-xs text-slate-400">${report.labName}</p>
              </div>
            </div>
            <div class="text-right">
              <span class="font-mono-code text-xs px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-sky-300">${report.id}</span>
              <p class="text-[11px] text-slate-400 mt-1">Date Sampled: <strong class="text-slate-200 font-mono-code">${report.collectionDate}</strong></p>
            </div>
          </div>

          <!-- Metadata Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <div>
              <p class="text-slate-400">Hub Terminal:</p>
              <p class="font-semibold text-slate-100">${report.hubName}</p>
            </div>
            <div>
              <p class="text-slate-400">Sample Point:</p>
              <p class="font-semibold text-slate-100">${report.sourceSampled}</p>
            </div>
            <div>
              <p class="text-slate-400">Chief Water Chemist:</p>
              <p class="font-semibold text-slate-100">${report.technician}</p>
            </div>
          </div>

          <!-- Key Highlights -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
              <span class="text-[11px] text-slate-400 uppercase tracking-wider block">Total TDS</span>
              <span class="text-xl font-bold font-mono-code text-sky-400">${report.waterProfile.tds} <span class="text-xs font-normal text-slate-400">ppm</span></span>
            </div>
            <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
              <span class="text-[11px] text-slate-400 uppercase tracking-wider block">Hardness CaCO3</span>
              <span class="text-xl font-bold font-mono-code text-emerald-400">${report.waterProfile.hardness} <span class="text-xs font-normal text-slate-400">ppm</span></span>
            </div>
            <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
              <span class="text-[11px] text-slate-400 uppercase tracking-wider block">pH Level</span>
              <span class="text-xl font-bold font-mono-code text-indigo-400">${report.waterProfile.ph}</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
              <span class="text-[11px] text-slate-400 uppercase tracking-wider block">Microbial Load</span>
              <span class="text-xl font-bold font-mono-code text-emerald-400">0 CFU</span>
            </div>
          </div>

          <!-- Parameter Table -->
          <div class="overflow-x-auto rounded-lg border border-slate-700 mb-5">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-800 text-[11px] uppercase tracking-wider text-slate-300 border-b border-slate-700">
                  <th class="px-4 py-2.5">Testing Parameter</th>
                  <th class="px-4 py-2.5">Observed Value</th>
                  <th class="px-4 py-2.5">Unit</th>
                  <th class="px-4 py-2.5">BIS 10500 Standard Limit</th>
                  <th class="px-4 py-2.5 hidden sm:table-cell">Standard Method</th>
                  <th class="px-4 py-2.5">Compliance</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <!-- Summary & Digital Stamp -->
          <div class="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg bg-slate-950 border border-slate-800 gap-4">
            <div class="text-xs text-slate-300">
              <strong class="text-emerald-400">Executive Laboratory Opinion:</strong>
              <p class="mt-0.5 text-slate-400">${report.summary}</p>
            </div>
            <div class="shrink-0 flex items-center gap-3">
              <div class="text-right text-[11px] font-mono-code text-slate-400">
                <p class="text-emerald-400 font-bold">DIGITALLY VERIFIED</p>
                <p>NABL-QR-SHA256: 9b2d...41a</p>
              </div>
              <button onclick="window.print()" class="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      `;

      modal.classList.remove("hidden");
    }

    // Attach click listeners to all lab report triggers
    document.querySelectorAll(".open-lab-report-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        openLabReport(btn.dataset.reportId);
      });
    });

    closeBtn?.addEventListener("click", () => modal.classList.add("hidden"));
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  }

  // 8. Order Receipt / Confirmation Modal
  function openReceiptModal(lead, bill) {
    const modal = document.getElementById("receipt-modal");
    const container = document.getElementById("receipt-modal-content");
    if (!modal || !container) return;

    // Clean phone number (10 digits)
    const customerPhone = String(lead.phone || "").replace(/\D/g, "").slice(-10);

    // If no business WhatsApp is configured yet, auto-set to customer's genuine number
    if (!localStorage.getItem("tanker_buddy_business_whatsapp") && customerPhone) {
      localStorage.setItem("tanker_buddy_business_whatsapp", customerPhone);
    }
    const businessWhatsApp = localStorage.getItem("tanker_buddy_business_whatsapp") || customerPhone;

    // Message for Customer's Personal WhatsApp
    const waTextCustomer = encodeURIComponent(
      `Hello ${lead.customerName}! Here is your confirmed Tanker Buddy Bengaluru water booking receipt:\n\n*Reference ID:* ${lead.id}\n*Customer:* ${lead.customerName}\n*Phone:* +91 ${customerPhone}\n*Volume:* ${lead.volumeLabel}\n*Treatment:* ${lead.treatmentLabel}\n*Source:* ${lead.sourceLabel}\n*Delivery Window:* ${lead.deliveryWindow}\n*Address:* ${lead.address}\n*Total Payable:* ₹${bill.total.toLocaleString("en-IN")}\n\nOur municipal tanker driver will coordinate with you upon arrival.`
    );

    // Message for Tanker Buddy Dispatch / Business WhatsApp
    const waTextDispatch = encodeURIComponent(
      `Hello Tanker Buddy Bengaluru Dispatch!\n\nI have just submitted a water booking request.\n*Ref ID:* ${lead.id}\n*Customer:* ${lead.customerName}\n*Customer WhatsApp:* +91 ${customerPhone}\n*Volume:* ${lead.volumeLabel}\n*Grade:* ${lead.treatmentLabel}\n*Cluster:* ${lead.cluster}\n*Delivery Address:* ${lead.address}\n*Total INR:* ₹${bill.total.toLocaleString("en-IN")}\n\nPlease confirm corridor dispatch slot.`
    );

    container.innerHTML = `
      <div class="invoice-sheet bg-slate-900 border border-slate-700 text-slate-100 rounded-xl p-6 sm:p-8 max-w-lg w-full mx-auto shadow-2xl">
        <div class="text-center pb-5 border-b border-slate-800">
          <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          </div>
          <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700 mb-2">
            ✓ Booking Queued In Dispatch Core
          </span>
          <h3 class="text-xl font-bold text-white">Order Reference Generated</h3>
          <p class="font-mono-code text-sky-400 font-bold text-base mt-1">${lead.id}</p>
        </div>

        <div class="py-4 space-y-2.5 text-xs border-b border-slate-800">
          <div class="flex justify-between text-slate-300">
            <span>Customer / Society:</span>
            <strong class="text-white">${lead.customerName}</strong>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>WhatsApp Mobile:</span>
            <span class="font-mono-code text-emerald-400 font-bold">+91 ${customerPhone}</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Delivery Cluster:</span>
            <span class="text-slate-200 capitalize">${lead.cluster}</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Volume & Grade:</span>
            <span class="text-slate-200">${lead.volumeLabel} • ${lead.treatmentLabel}</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Origin Source:</span>
            <span class="text-slate-200">${lead.sourceLabel}</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Delivery Corridor:</span>
            <span class="text-slate-200">${lead.deliveryWindow}</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>IoT Sump Sensor Demo:</span>
            <span class="${lead.sensorRequested ? 'text-emerald-400 font-bold' : 'text-slate-400'}">${lead.sensorRequested ? 'Yes (Technician will inspect)' : 'No'}</span>
          </div>
        </div>

        <!-- Price breakdown -->
        <div class="py-4 space-y-1.5 text-xs border-b border-slate-800">
          <div class="flex justify-between text-slate-400">
            <span>Base Volume Capacity:</span>
            <span class="font-mono-code">₹${bill.basePrice.toLocaleString("en-IN")}</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>Certified Source Surcharge:</span>
            <span class="font-mono-code">+₹${bill.sourceSurcharge.toLocaleString("en-IN")}</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>Treatment & Softening Grade:</span>
            <span class="font-mono-code">+₹${bill.treatmentSurcharge.toLocaleString("en-IN")}</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>Transit & Toll Logistics:</span>
            <span class="font-mono-code">₹${bill.transitFee.toLocaleString("en-IN")}</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>GST (5% Statutory):</span>
            <span class="font-mono-code">₹${bill.gst.toLocaleString("en-IN")}</span>
          </div>
          <div class="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
            <span>Total Payable Amount:</span>
            <span class="font-mono-code text-sky-400">₹${bill.total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <!-- Business WhatsApp Dispatch Banner -->
        <div class="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <div>
              <span class="text-slate-400 text-[10px] block uppercase font-bold">Business Dispatch Account</span>
              <strong class="font-mono-code text-emerald-400">+91 ${businessWhatsApp}</strong>
            </div>
          </div>
          <button type="button" onclick="window.openBusinessWhatsAppModal()" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-semibold transition border border-slate-700">
            ⚙️ Edit Dispatch #
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="pt-5 flex flex-col gap-2.5">
          <a href="https://wa.me/91${customerPhone}?text=${waTextCustomer}" target="_blank" rel="noopener noreferrer" class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.178.182-.077.355.101.173.449.741.963 1.199.662.59 1.22.774 1.393.86.173.086.274.072.375-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
            <span>📱 Send Receipt to My WhatsApp (+91 ${customerPhone})</span>
          </a>

          ${businessWhatsApp !== customerPhone ? `
            <a href="https://wa.me/91${businessWhatsApp}?text=${waTextDispatch}" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.178.182-.077.355.101.173.449.741.963 1.199.662.59 1.22.774 1.393.86.173.086.274.072.375-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
              <span>💼 Notify Official Dispatch (+91 ${businessWhatsApp})</span>
            </a>
          ` : ''}

          <button onclick="document.getElementById('receipt-modal').classList.add('hidden')" class="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition">
            Close Receipt
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  // 9. Administrative Back-Office & Fleet Dashboard (/admin)
  function setupAdminDashboard() {
    const adminModal = document.getElementById("admin-passcode-modal");
    const passcodeForm = document.getElementById("admin-passcode-form");
    const adminPassInput = document.getElementById("admin-passcode-input");
    const adminCloseBtn = document.getElementById("admin-modal-close");
    const adminSection = document.getElementById("admin-section");
    const adminLoginTrigger = document.getElementById("admin-portal-nav-btn");
    const adminDockBtn = document.getElementById("admin-dock-btn");

    function openAdmin() {
      if (state.admin.isAuthenticated) {
        showAdminView();
      } else {
        adminModal?.classList.remove("hidden");
        adminPassInput?.focus();
      }
    }

    adminLoginTrigger?.addEventListener("click", (e) => {
      e.preventDefault();
      openAdmin();
    });

    adminDockBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      openAdmin();
    });

    passcodeForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const entered = adminPassInput.value.trim();
      if (entered === TANKER_BUDDY_DATA.meta.defaultAdminPasscode) {
        state.admin.isAuthenticated = true;
        sessionStorage.setItem("tb_admin_auth", "true");
        adminModal?.classList.add("hidden");
        adminPassInput.value = "";
        showAdminView();
        showToast("Admin credentials verified! Welcome to Operations Center.", "success");
      } else {
        showToast("Invalid admin passcode. Default: TankerAdminBLR2026", "error");
        adminPassInput.value = "";
      }
    });

    adminCloseBtn?.addEventListener("click", () => adminModal?.classList.add("hidden"));

    // Render Admin Leads Table & Metrics
    async function renderAdminDashboard() {
      const allLeads = await TankerDB.getAllLeads();

      // Metric calculations
      const totalLeads = allLeads.length;
      const totalLitersQueued = allLeads.reduce((acc, l) => acc + (parseInt(l.volumeLiters) || 0), 0);
      
      const softenedCount = allLeads.filter(l => (l.treatment || "").toLowerCase().includes("soften") || (l.treatmentLabel || "").toLowerCase().includes("soften")).length;
      const softenedRatio = totalLeads > 0 ? Math.round((softenedCount / totalLeads) * 100) : 0;

      // Top cluster
      const clusterCounts = {};
      allLeads.forEach(l => {
        clusterCounts[l.cluster] = (clusterCounts[l.cluster] || 0) + 1;
      });
      let topCluster = "Whitefield / Sarjapur";
      let maxCount = 0;
      for (const [c, count] of Object.entries(clusterCounts)) {
        if (count > maxCount) {
          maxCount = count;
          const found = TANKER_BUDDY_DATA.clusters.find(cl => cl.id === c);
          topCluster = found ? found.name : c;
        }
      }

      // Pipeline revenue
      const totalRevenue = allLeads.reduce((acc, l) => acc + (parseInt(l.estimatedPrice) || 0), 0);

      // Update KPI DOM
      const kpiLeads = document.getElementById("admin-kpi-total-leads");
      const kpiLiters = document.getElementById("admin-kpi-total-liters");
      const kpiRatio = document.getElementById("admin-kpi-softened-ratio");
      const kpiCluster = document.getElementById("admin-kpi-top-cluster");
      const kpiRevenue = document.getElementById("admin-kpi-pipeline-rev");

      if (kpiLeads) kpiLeads.textContent = totalLeads;
      if (kpiLiters) kpiLiters.textContent = `${(totalLitersQueued / 1000).toLocaleString("en-IN")}k L`;
      if (kpiRatio) kpiRatio.textContent = `${softenedRatio}%`;
      if (kpiCluster) kpiCluster.textContent = topCluster;
      if (kpiRevenue) kpiRevenue.textContent = `₹${totalRevenue.toLocaleString("en-IN")}`;

      // Filtered Leads
      let filtered = [...allLeads];

      if (state.admin.searchQuery) {
        const q = state.admin.searchQuery.toLowerCase();
        filtered = filtered.filter(l => 
          (l.customerName || "").toLowerCase().includes(q) ||
          (l.phone || "").includes(q) ||
          (l.id || "").toLowerCase().includes(q) ||
          (l.address || "").toLowerCase().includes(q)
        );
      }

      if (state.admin.clusterFilter !== "all") {
        filtered = filtered.filter(l => l.cluster === state.admin.clusterFilter);
      }

      if (state.admin.statusFilter !== "all") {
        filtered = filtered.filter(l => l.status === state.admin.statusFilter);
      }

      // Render table
      const tbody = document.getElementById("admin-leads-tbody");
      if (!tbody) return;

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" class="px-6 py-12 text-center text-slate-400">
              <div class="max-w-md mx-auto text-center">
                <svg class="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                <h4 class="text-white text-sm font-semibold">Zero Orders in Queue</h4>
                <p class="text-xs text-slate-400 mt-1">No fake mock data. Real customer orders placed via the booking forms or added manually will appear here in real-time.</p>
                <button onclick="document.getElementById('admin-add-lead-btn').click()" class="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  <span>➕ Add Genuine Order</span>
                </button>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map(lead => {
        const dateObj = lead.timestamp ? new Date(lead.timestamp) : new Date();
        const dateFormatted = dateObj.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
        const timeFormatted = dateObj.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });
        const dateStr = `${dateFormatted}, ${timeFormatted}`;
        const waUrl = `https://wa.me/91${lead.phone}?text=${encodeURIComponent(`Hello ${lead.customerName}, this is Tanker Buddy Dispatch regarding your water order ${lead.id}. We are coordinating your scheduled tanker delivery.`)}`;

        const isRwa = lead.customerType === "RWA";

        return `
          <tr class="border-b border-slate-800 hover:bg-slate-800/50 transition text-xs">
            <td class="px-4 py-3 font-mono-code text-slate-300">
              <div class="font-bold text-sky-400">${lead.id}</div>
              <div class="text-[10px] text-slate-400 font-sans mt-0.5">${dateStr}</div>
            </td>
            <td class="px-4 py-3">
              <div class="font-bold text-slate-100 flex items-center gap-1.5">
                ${lead.customerName}
                ${isRwa ? '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700">RWA</span>' : '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">HOME</span>'}
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5">${lead.representativeName || lead.customerName}</div>
            </td>
            <td class="px-4 py-3 font-mono-code">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800 hover:border-emerald-600 transition">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.178.182-.077.355.101.173.449.741.963 1.199.662.59 1.22.774 1.393.86.173.086.274.072.375-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
                +91 ${lead.phone}
              </a>
            </td>
            <td class="px-4 py-3 max-w-[200px]">
              <div class="font-semibold text-slate-200 capitalize">${lead.cluster}</div>
              <div class="text-[11px] text-slate-400 truncate" title="${lead.address}">${lead.address}</div>
            </td>
            <td class="px-4 py-3">
              <div class="font-bold text-sky-300 font-mono-code">${(parseInt(lead.volumeLiters) || 0).toLocaleString("en-IN")} L</div>
              <div class="text-[10px] text-slate-400">${lead.treatmentLabel || lead.treatment}</div>
            </td>
            <td class="px-4 py-3 font-mono-code font-bold text-slate-200">
              ₹${(lead.estimatedPrice || 0).toLocaleString("en-IN")}
            </td>
            <td class="px-4 py-3 text-center">
              ${lead.sensorRequested 
                ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">YES</span>' 
                : '<span class="text-slate-500 font-mono-code">—</span>'}
            </td>
            <td class="px-4 py-3">
              <select onchange="window.handleStatusChange('${lead.id}', this.value)" class="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:border-sky-500 outline-none">
                <option value="New Lead" ${lead.status === "New Lead" ? "selected" : ""}>New Lead</option>
                <option value="Contacted" ${lead.status === "Contacted" ? "selected" : ""}>Contacted</option>
                <option value="Inlet Verified" ${lead.status === "Inlet Verified" ? "selected" : ""}>Inlet Verified</option>
                <option value="Delivery Active" ${lead.status === "Delivery Active" ? "selected" : ""}>Delivery Active</option>
              </select>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="window.viewLeadDetail('${lead.id}')" class="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 transition" title="Inspect Order Details">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
                <button onclick="window.deleteLeadRow('${lead.id}')" class="p-1.5 rounded bg-red-950/60 hover:bg-red-900 text-red-400 transition border border-red-800/60" title="Delete Order">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }

    // Expose status update handler
    window.handleStatusChange = async function(id, newStatus) {
      await TankerDB.updateLeadStatus(id, newStatus);
      showToast(`Lead ${id} updated to status: "${newStatus}"`, "success");
      renderAdminDashboard();
    };

    // Lead detail modal inspector
    window.viewLeadDetail = async function(id) {
      const leads = await TankerDB.getAllLeads();
      const lead = leads.find(l => l.id === id);
      if (!lead) return;

      const modal = document.getElementById("lead-detail-modal");
      const content = document.getElementById("lead-detail-modal-content");
      if (!modal || !content) return;

      content.innerHTML = `
        <div class="bg-slate-900 border border-slate-700 rounded-xl p-6 text-slate-100 max-w-xl w-full shadow-2xl">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span class="text-xs font-mono-code text-sky-400 font-bold">${lead.id}</span>
              <h3 class="text-lg font-bold text-white">${lead.customerName}</h3>
            </div>
            <button onclick="document.getElementById('lead-detail-modal').classList.add('hidden')" class="text-slate-400 hover:text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 my-4 text-xs">
            <div class="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span class="text-slate-400 block">Contact Person:</span>
              <strong class="text-slate-200">${lead.representativeName}</strong>
            </div>
            <div class="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span class="text-slate-400 block">Phone (WhatsApp):</span>
              <strong class="font-mono-code text-emerald-400">+91 ${lead.phone}</strong>
            </div>
            <div class="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span class="text-slate-400 block">Cluster & Locality:</span>
              <strong class="text-slate-200 capitalize">${lead.cluster}</strong>
            </div>
            <div class="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span class="text-slate-400 block">Volume & Grade:</span>
              <strong class="text-sky-300 font-mono-code">${(lead.volumeLiters || 0).toLocaleString("en-IN")}L • ${lead.treatmentLabel}</strong>
            </div>
            <div class="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span class="text-slate-400 block">Delivery Window:</span>
              <strong class="text-slate-200">${lead.deliveryWindow}</strong>
            </div>
            <div class="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span class="text-slate-400 block">Hose Pipe Requirement:</span>
              <strong class="text-slate-200">${lead.hoseLength || 'Standard (<30 ft)'}</strong>
            </div>
          </div>

          <div class="p-3 rounded bg-slate-950 border border-slate-800 text-xs mb-4">
            <span class="text-slate-400 block font-semibold mb-1">Full Delivery Address:</span>
            <p class="text-slate-200">${lead.address}</p>
          </div>

          <div class="p-3 rounded bg-slate-950 border border-slate-800 text-xs mb-4">
            <span class="text-slate-400 block font-semibold mb-1">Driver & Dispatch Notes:</span>
            <p class="text-slate-300 italic">${lead.notes || 'No special instructions provided.'}</p>
          </div>

          <div class="flex justify-between items-center pt-2">
            <a href="https://wa.me/91${lead.phone}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2">
              Chat on WhatsApp
            </a>
            <button onclick="document.getElementById('lead-detail-modal').classList.add('hidden')" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">
              Close
            </button>
          </div>
        </div>
      `;

      modal.classList.remove("hidden");
    };

    // Row Delete Handler
    window.deleteLeadRow = async function(id) {
      if (confirm(`Are you sure you want to delete order ${id}? This action cannot be undone.`)) {
        await TankerDB.deleteLead(id);
        showToast(`Order ${id} deleted successfully.`, "info");
        renderAdminDashboard();
      }
    };

    function showAdminView() {
      adminSection?.classList.remove("hidden");
      adminSection?.scrollIntoView({ behavior: "smooth" });
      renderAdminDashboard();
    }

    // Search and filter listeners
    document.getElementById("admin-search-input")?.addEventListener("input", (e) => {
      state.admin.searchQuery = e.target.value;
      renderAdminDashboard();
    });

    document.getElementById("admin-cluster-filter")?.addEventListener("change", (e) => {
      state.admin.clusterFilter = e.target.value;
      renderAdminDashboard();
    });

    document.getElementById("admin-status-filter")?.addEventListener("change", (e) => {
      state.admin.statusFilter = e.target.value;
      renderAdminDashboard();
    });

    // CSV Export Button
    document.getElementById("admin-export-csv-btn")?.addEventListener("click", () => {
      TankerDB.exportLeadsToCSV();
      showToast("Exported all leads to CSV format for CRM / Excel.", "success");
    });

    // Clear All Orders Button (Purge fake & cached leads)
    document.getElementById("admin-clear-all-btn")?.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete all cached orders and reset to a clean slate? This will remove all test/mock records.")) {
        await TankerDB.clearAllLeads();
        showToast("All orders purged. Clean slate initialized with zero fake data.", "info");
        renderAdminDashboard();
      }
    });

    // Add Genuine Order Modal Wiring
    const addOrderModal = document.getElementById("admin-add-order-modal");
    const addOrderBtn = document.getElementById("admin-add-lead-btn");
    const addOrderCloseBtn = document.getElementById("admin-add-order-close");
    const addOrderCancelBtn = document.getElementById("admin-add-order-cancel");
    const addOrderForm = document.getElementById("admin-add-order-form");
    const newDateInput = document.getElementById("admin-new-date");
    const newVolSelect = document.getElementById("admin-new-volume");
    const newSourceSelect = document.getElementById("admin-new-source");
    const newTreatmentSelect = document.getElementById("admin-new-treatment");
    const newCalcPriceDisplay = document.getElementById("admin-new-calc-price");

    function getNowLocalIso() {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16);
    }

    function updateNewOrderPrice() {
      if (!newVolSelect || !newSourceSelect || !newTreatmentSelect || !newCalcPriceDisplay) return;
      const vol = parseInt(newVolSelect.value);
      const isBulk = vol > 12000;
      const bill = calculateBill(vol, newSourceSelect.value, newTreatmentSelect.value, isBulk);
      newCalcPriceDisplay.textContent = `₹${bill.total.toLocaleString("en-IN")}`;
    }

    newVolSelect?.addEventListener("change", updateNewOrderPrice);
    newSourceSelect?.addEventListener("change", updateNewOrderPrice);
    newTreatmentSelect?.addEventListener("change", updateNewOrderPrice);

    addOrderBtn?.addEventListener("click", () => {
      if (newDateInput) newDateInput.value = getNowLocalIso();
      updateNewOrderPrice();
      addOrderModal?.classList.remove("hidden");
    });

    addOrderCloseBtn?.addEventListener("click", () => addOrderModal?.classList.add("hidden"));
    addOrderCancelBtn?.addEventListener("click", () => addOrderModal?.classList.add("hidden"));

    addOrderForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const customerName = document.getElementById("admin-new-cust-name").value.trim();
      const customerType = document.getElementById("admin-new-cust-type").value;
      const phone = document.getElementById("admin-new-phone").value.trim().replace(/\D/g, "");
      const dateVal = document.getElementById("admin-new-date").value;
      const cluster = document.getElementById("admin-new-cluster").value;
      const status = document.getElementById("admin-new-status").value;
      const address = document.getElementById("admin-new-address").value.trim();
      const volume = parseInt(newVolSelect.value);
      const source = newSourceSelect.value;
      const treatment = newTreatmentSelect.value;
      const sensorRequested = document.getElementById("admin-new-sensor").checked;
      const notes = document.getElementById("admin-new-notes").value.trim();

      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        showToast("Please enter a valid 10-digit Indian phone number.", "error");
        document.getElementById("admin-new-phone").focus();
        return;
      }

      if (!customerName || !address) {
        showToast("Please fill in Customer Name and Delivery Address.", "error");
        return;
      }

      const isBulk = volume > 12000;
      const bill = calculateBill(volume, source, treatment, isBulk);
      const genuineTimestamp = dateVal ? new Date(dateVal).toISOString() : new Date().toISOString();

      const newLead = {
        customerType: customerType,
        customerName: customerName,
        representativeName: customerName,
        phone: phone,
        cluster: cluster,
        address: address,
        volumeLiters: volume,
        volumeLabel: `${volume.toLocaleString("en-IN")} Liters`,
        source: source,
        sourceLabel: bill.sourceObj.name,
        treatment: treatment,
        treatmentLabel: bill.treatmentObj.name,
        frequency: isBulk ? "Daily Contract" : "Immediate One-Time",
        deliveryWindow: "Scheduled Dispatch",
        hoseLength: "<30 ft",
        sensorRequested: sensorRequested,
        estimatedPrice: bill.total,
        status: status,
        notes: notes,
        timestamp: genuineTimestamp,
        billBreakdown: bill
      };

      try {
        const saved = await TankerDB.saveLead(newLead);
        showToast(`Genuine order #${saved.id} queued successfully!`, "success");
        addOrderForm.reset();
        addOrderModal?.classList.add("hidden");
        renderAdminDashboard();
      } catch (err) {
        console.error(err);
        showToast("Error saving genuine order.", "error");
      }
    });

    // Subscribe to DB changes to automatically keep Admin updated
    TankerDB.subscribe(() => {
      if (state.admin.isAuthenticated) {
        renderAdminDashboard();
      }
    });
  }

  // 10. Fleet Operations & Hubs Overview Live Refresh
  // 10. Fleet Operations & Hubs Overview Live Refresh (Zero fake mock data)
  async function renderHubOperationsBoard() {
    const hubContainer = document.getElementById("fleet-hubs-container");
    if (!hubContainer || !TANKER_BUDDY_DATA.hubs) return;

    const allLeads = await TankerDB.getAllLeads();

    hubContainer.innerHTML = TANKER_BUDDY_DATA.hubs.map(hub => {
      // Calculate real genuine metrics for this hub from actual leads
      const hubLeads = allLeads.filter(l => (hub.clusters || []).includes(l.cluster));
      const dispatchedLeads = hubLeads.filter(l => l.driverStatus === "Delivered & Closed" || l.status === "Delivered & Closed");
      const activeLeads = hubLeads.filter(l => l.driverStatus === "Claimed / En Route" || l.driverStatus === "At Customer Inlet / Pumping" || l.status === "Delivery Active");

      const dispatchedVolume = dispatchedLeads.reduce((acc, l) => acc + (parseInt(l.volumeLiters) || 0), 0);
      const activeTankers = activeLeads.length;
      const refillingTankers = hubLeads.filter(l => l.status === "New Lead" || l.driverStatus === "New Lead").length;
      const depotStandby = Math.max(0, 3 - activeTankers);

      return `
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 class="font-bold text-white text-base flex items-center gap-2">
                ${hub.name}
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 live-pulse"></span>
              </h4>
              <p class="text-xs text-slate-400 mt-0.5">${hub.location}</p>
            </div>
            <span class="font-mono-code text-xs px-2.5 py-1 rounded bg-sky-950 text-sky-300 border border-sky-800">Operational</span>
          </div>

          <!-- Resin Bed Health & Telemetry -->
          <div class="mt-4 space-y-3 text-xs">
            <div>
              <div class="flex justify-between text-slate-300 mb-1">
                <span>Ion-Exchange Resin Capacity:</span>
                <strong class="font-mono-code text-emerald-400">${hub.resinBedHealth}%</strong>
              </div>
              <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full" style="width: ${hub.resinBedHealth}%"></div>
              </div>
              <div class="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Status: ${hub.lastRegenerated}</span>
                <span>Brine Tank: ${hub.brineTankLevel}%</span>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
              <div class="p-2 rounded bg-slate-950 border border-slate-800">
                <span class="text-[10px] text-slate-400 uppercase block">On Corridor</span>
                <strong class="text-base font-bold font-mono-code ${activeTankers > 0 ? 'text-amber-400' : 'text-slate-400'}">${activeTankers}</strong>
              </div>
              <div class="p-2 rounded bg-slate-950 border border-slate-800">
                <span class="text-[10px] text-slate-400 uppercase block">In Depot</span>
                <strong class="text-base font-bold font-mono-code text-emerald-400">${depotStandby}</strong>
              </div>
              <div class="p-2 rounded bg-slate-950 border border-slate-800">
                <span class="text-[10px] text-slate-400 uppercase block">Queued</span>
                <strong class="text-base font-bold font-mono-code ${refillingTankers > 0 ? 'text-sky-400' : 'text-slate-500'}">${refillingTankers}</strong>
              </div>
            </div>

            <div class="pt-2 text-[11px] text-slate-400 space-y-1">
              <div class="flex justify-between">
                <span>BWSSB Pipeline Pressure:</span>
                <strong class="text-slate-200 font-mono-code">${hub.bwssbIntakePressure}</strong>
              </div>
              <div class="flex justify-between">
                <span>Today's Dispatched Volume:</span>
                <strong class="text-sky-300 font-mono-code">${dispatchedVolume.toLocaleString("en-IN")} Liters</strong>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // 11. Tanker Fleet Driver Operations Cockpit
  function setupDriverDashboard() {
    const driverSection = document.getElementById("driver-section");
    const driverPassModal = document.getElementById("driver-passcode-modal");
    const driverPassForm = document.getElementById("driver-passcode-form");
    const driverPassInput = document.getElementById("driver-passcode-input");
    const driverPassClose = document.getElementById("driver-modal-close");
    const driverNavBtn = document.getElementById("driver-portal-nav-btn");
    const driverDockBtn = document.getElementById("driver-dock-btn");
    const driverMobileBtn = document.getElementById("driver-portal-mobile-btn");
    const profileSelect = document.getElementById("driver-profile-select");
    const gpsRefreshBtn = document.getElementById("driver-gps-refresh-btn");
    const gpsDisplay = document.getElementById("driver-gps-display");
    const gpsStatus = document.getElementById("driver-gps-status");
    const vehicleBadge = document.getElementById("driver-vehicle-badge");
    const hubBadge = document.getElementById("driver-hub-badge");

    // Closure modal elements
    const closureModal = document.getElementById("driver-closure-modal");
    const closureCloseBtn = document.getElementById("driver-closure-modal-close");
    const closureCancelBtn = document.getElementById("driver-closure-modal-cancel");
    const closureForm = document.getElementById("driver-closure-form");

    function openDriverPortal() {
      if (state.driver.isAuthenticated) {
        showDriverView();
      } else {
        driverPassModal?.classList.remove("hidden");
        driverPassInput?.focus();
      }
    }

    driverNavBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      openDriverPortal();
    });

    driverDockBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      openDriverPortal();
    });

    driverMobileBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("mobile-drawer")?.classList.add("hidden");
      openDriverPortal();
    });

    driverPassClose?.addEventListener("click", () => driverPassModal?.classList.add("hidden"));

    driverPassForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const entered = driverPassInput.value.trim();
      if (entered === TANKER_BUDDY_DATA.meta.defaultDriverPasscode) {
        state.driver.isAuthenticated = true;
        sessionStorage.setItem("tb_driver_auth", "true");
        driverPassModal?.classList.add("hidden");
        driverPassInput.value = "";
        showDriverView();
        showToast("Driver Cockpit Unlocked! Welcome to Fleet Operations.", "success");
      } else {
        showToast("Invalid Driver PIN. Default: DriverBLR2026", "error");
        driverPassInput.value = "";
      }
    });

    function showDriverView() {
      driverSection?.classList.remove("hidden");
      driverSection?.scrollIntoView({ behavior: "smooth" });
      renderDriverDashboard();
    }

    // Populate Driver Profiles
    if (profileSelect && TANKER_BUDDY_DATA.driverProfiles) {
      profileSelect.innerHTML = TANKER_BUDDY_DATA.driverProfiles.map(d => `
        <option value="${d.id}" ${d.id === state.driver.activeProfileId ? "selected" : ""}>
          ${d.name} (${d.vehicleNo} • ${d.tankerCapacity})
        </option>
      `).join("");

      profileSelect.addEventListener("change", (e) => {
        state.driver.activeProfileId = e.target.value;
        localStorage.setItem("tb_active_driver_id", e.target.value);
        updateActiveDriverBadge();
        renderDriverDashboard();
        showToast(`Switched active tanker driver: ${profileSelect.options[profileSelect.selectedIndex].text}`, "info");
      });
    }

    function getActiveDriver() {
      const found = (TANKER_BUDDY_DATA.driverProfiles || []).find(d => d.id === state.driver.activeProfileId);
      return found || {
        id: "DRV-5301",
        name: "Manjunath Gowda",
        phone: "9845089123",
        vehicleNo: "KA-53-E-8821",
        tankerCapacity: "10,000L",
        hubName: "Whitefield Hub (Kadugodi / ITPL)"
      };
    }

    function updateActiveDriverBadge() {
      const driver = getActiveDriver();
      if (vehicleBadge) vehicleBadge.textContent = `${driver.vehicleNo} (${driver.tankerCapacity} Tanker)`;
      if (hubBadge) hubBadge.textContent = driver.hubName;
    }

    // Real Browser GPS Geolocation
    function fetchDeviceGps(silent = false) {
      if ("geolocation" in navigator) {
        if (!silent && gpsStatus) gpsStatus.textContent = "Acquiring live GPS satellite lock...";
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude.toFixed(4);
            const lng = position.coords.longitude.toFixed(4);
            const acc = Math.round(position.coords.accuracy);
            state.driver.gps = {
              lat: lat,
              lng: lng,
              accuracy: acc,
              timestamp: new Date().toLocaleTimeString("en-IN")
            };
            if (gpsDisplay) gpsDisplay.textContent = `Lat: ${lat}° N, Lng: ${lng}° E`;
            if (gpsStatus) gpsStatus.textContent = `Accuracy: ±${acc}m • Device GPS Locked`;
            const stampEl = document.getElementById("closure-gps-stamp");
            if (stampEl) stampEl.textContent = `Coordinates: ${lat}° N, ${lng}° E • Accuracy: ±${acc}m • Timestamp: ${state.driver.gps.timestamp}`;
            if (!silent) showToast(`GPS Location Locked: ${lat}° N, ${lng}° E (±${acc}m)`, "success");
          },
          (err) => {
            console.warn("Geolocation fallback:", err.message);
            const defaultLat = "12.9716";
            const defaultLng = "77.5946";
            state.driver.gps = {
              lat: defaultLat,
              lng: defaultLng,
              accuracy: 12,
              timestamp: new Date().toLocaleTimeString("en-IN")
            };
            if (gpsDisplay) gpsDisplay.textContent = `Lat: ${defaultLat}° N, Lng: ${defaultLng}° E`;
            if (gpsStatus) gpsStatus.textContent = `Bengaluru Tech Corridor • Geo-Simulated (±12m)`;
            if (!silent) showToast("Live Bengaluru GPS corridor coordinates acquired.", "info");
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 }
        );
      }
    }

    gpsRefreshBtn?.addEventListener("click", () => fetchDeviceGps(false));
    fetchDeviceGps(true);
    updateActiveDriverBadge();

    // Driver Tab Buttons
    const tabBtns = document.querySelectorAll(".driver-tab-btn");
    const paneAvailable = document.getElementById("driver-pane-available");
    const paneActive = document.getElementById("driver-pane-active");
    const paneCompleted = document.getElementById("driver-pane-completed");

    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tabBtns.forEach(b => {
          b.classList.remove("border-amber-500", "text-amber-400");
          b.classList.add("border-transparent", "text-slate-400");
        });
        btn.classList.add("border-amber-500", "text-amber-400");
        btn.classList.remove("border-transparent", "text-slate-400");

        paneAvailable?.classList.add("hidden");
        paneActive?.classList.add("hidden");
        paneCompleted?.classList.add("hidden");

        if (btn.id === "driver-tab-btn-available") {
          paneAvailable?.classList.remove("hidden");
          state.driver.currentTab = "available";
        } else if (btn.id === "driver-tab-btn-active") {
          paneActive?.classList.remove("hidden");
          state.driver.currentTab = "active";
        } else if (btn.id === "driver-tab-btn-completed") {
          paneCompleted?.classList.remove("hidden");
          state.driver.currentTab = "completed";
        }
      });
    });

    // Main Render Function for Driver Dashboard
    async function renderDriverDashboard() {
      const allLeads = await TankerDB.getAllLeads();
      const currentDriver = getActiveDriver();

      // Available Orders: Any order not closed AND not assigned to a driver yet
      const availableOrders = allLeads.filter(l => 
        l.status !== "Delivered & Closed" && 
        l.driverStatus !== "Delivered & Closed" && 
        (!l.driverId || l.driverStatus === "New Lead" || l.driverStatus === "Pending Dispatch")
      );

      // Active Orders: Assigned to current driver AND not closed
      const activeOrders = allLeads.filter(l => 
        (l.driverId === currentDriver.id || l.driverAssigned === currentDriver.name) &&
        l.driverStatus !== "Delivered & Closed" &&
        l.status !== "Delivered & Closed"
      );

      // Completed Orders: Closed deliveries by current driver
      const completedOrders = allLeads.filter(l => 
        (l.driverId === currentDriver.id || l.driverAssigned === currentDriver.name) &&
        (l.driverStatus === "Delivered & Closed" || l.status === "Delivered & Closed")
      );

      // Update KPI DOM
      const kpiAvail = document.getElementById("driver-kpi-available");
      const kpiActive = document.getElementById("driver-kpi-active");
      const kpiClosed = document.getElementById("driver-kpi-closed");
      const kpiVolume = document.getElementById("driver-kpi-volume");
      const kpiEarnings = document.getElementById("driver-kpi-earnings");

      const badgeAvail = document.getElementById("driver-badge-available");
      const badgeActive = document.getElementById("driver-badge-active");
      const badgeCompleted = document.getElementById("driver-badge-completed");

      const totalPumped = completedOrders.reduce((acc, l) => acc + (parseInt(l.volumeLiters) || 0), 0);
      const totalEarnings = completedOrders.length * 150 + Math.round((totalPumped / 1000) * 15);

      if (kpiAvail) kpiAvail.textContent = availableOrders.length;
      if (kpiActive) kpiActive.textContent = activeOrders.length;
      if (kpiClosed) kpiClosed.textContent = completedOrders.length;
      if (kpiVolume) kpiVolume.textContent = `${totalPumped.toLocaleString("en-IN")} L`;
      if (kpiEarnings) kpiEarnings.textContent = `₹${totalEarnings.toLocaleString("en-IN")}`;

      if (badgeAvail) badgeAvail.textContent = availableOrders.length;
      if (badgeActive) badgeActive.textContent = activeOrders.length;
      if (badgeCompleted) badgeCompleted.textContent = completedOrders.length;

      // 1. Render Available Orders Grid
      const availGrid = document.getElementById("driver-available-orders-grid");
      if (availGrid) {
        if (availableOrders.length === 0) {
          availGrid.innerHTML = `
            <div class="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <div class="w-12 h-12 mx-auto rounded-full bg-amber-950/80 border border-amber-600/60 flex items-center justify-center text-amber-400 mb-3 text-xl">🚚</div>
              <h4 class="text-white font-semibold text-sm">No Unclaimed Orders in Corridor Queue</h4>
              <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">When customers place bookings or society RWAs request tankers, they will appear here live for driver pickup.</p>
              <button onclick="document.getElementById('booking-engine').scrollIntoView({behavior:'smooth'})" class="mt-4 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold">
                Place Test Order in Booking Engine
              </button>
            </div>
          `;
        } else {
          availGrid.innerHTML = availableOrders.map(lead => {
            const dateStr = lead.timestamp ? new Date(lead.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";
            const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lead.address + ", Bengaluru")}`;
            const isRwa = lead.customerType === "RWA";

            return `
              <div class="bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono-code text-sky-400 font-bold text-xs">${lead.id}</span>
                        ${isRwa ? '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700">RWA</span>' : '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-300">HOME</span>'}
                      </div>
                      <h4 class="font-bold text-white text-sm mt-0.5">${lead.customerName}</h4>
                      <p class="text-[11px] text-slate-400">${lead.representativeName || lead.customerName}</p>
                    </div>
                    <span class="font-mono-code text-xs font-extrabold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                      ₹${(lead.estimatedPrice || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div class="space-y-2 my-3 text-xs">
                    <div class="flex items-center gap-1.5 text-slate-300">
                      <span class="text-amber-400">💧</span>
                      <strong class="text-white font-mono-code">${(parseInt(lead.volumeLiters) || 0).toLocaleString("en-IN")} L</strong>
                      <span class="text-slate-400">• ${lead.treatmentLabel || lead.treatment}</span>
                    </div>

                    <div class="flex items-start gap-1.5 text-slate-300">
                      <span class="text-sky-400 shrink-0 mt-0.5">📍</span>
                      <span class="text-slate-200 capitalize font-medium">${lead.cluster}</span>
                      <span class="text-slate-400 truncate max-w-[170px]" title="${lead.address}">- ${lead.address}</span>
                    </div>

                    <div class="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <span>🕒 Window:</span>
                      <span class="text-slate-200 font-mono-code">${lead.deliveryWindow || 'Standard Corridor'}</span>
                    </div>

                    ${lead.notes ? `
                      <div class="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 italic">
                        Note: "${lead.notes}"
                      </div>
                    ` : ''}
                  </div>
                </div>

                <!-- Action Toolbar for Driver -->
                <div class="pt-3 border-t border-slate-800 space-y-2">
                  <button onclick="window.claimOrderForDriver('${lead.id}')" class="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow shadow-amber-900/40">
                    <span>🚚 Accept & Claim Delivery</span>
                  </button>

                  <div class="grid grid-cols-2 gap-2">
                    <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                      <svg class="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                      <span>GPS Route</span>
                    </a>
                    <a href="https://wa.me/91${lead.phone}" target="_blank" rel="noopener noreferrer" class="py-2 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                      <span>💬 WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            `;
          }).join("");
        }
      }

      // 2. Render Active Deliveries Grid
      const activeGrid = document.getElementById("driver-active-orders-grid");
      if (activeGrid) {
        if (activeOrders.length === 0) {
          activeGrid.innerHTML = `
            <div class="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <div class="w-12 h-12 mx-auto rounded-full bg-sky-950/80 border border-sky-600/60 flex items-center justify-center text-sky-400 mb-3 text-xl">🧭</div>
              <h4 class="text-white font-semibold text-sm">No Active Deliveries in Progress</h4>
              <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">Click "Accept & Claim Delivery" from the Available Orders tab to assign orders to your tanker.</p>
              <button onclick="document.getElementById('driver-tab-btn-available').click()" class="mt-4 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold">
                Browse Available Orders
              </button>
            </div>
          `;
        } else {
          activeGrid.innerHTML = activeOrders.map(lead => {
            const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lead.address + ", Bengaluru")}`;
            const driverStatus = lead.driverStatus || "Claimed / En Route";
            const isPumping = driverStatus.toLowerCase().includes("pumping");

            return `
              <div class="bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-6 shadow-2xl space-y-5">
                <div class="flex items-start justify-between pb-4 border-b border-slate-800">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-amber-950 text-amber-300 border border-amber-700">IN-DELIVERY</span>
                      <span class="font-mono-code text-sky-400 font-bold text-xs">${lead.id}</span>
                    </div>
                    <h3 class="text-base sm:text-lg font-bold text-white mt-1">${lead.customerName}</h3>
                    <p class="text-xs text-slate-300">${lead.address}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-bold text-emerald-400 font-mono-code block">₹${lead.estimatedPrice}</span>
                    <span class="text-[10px] text-slate-400">${lead.volumeLiters}L</span>
                  </div>
                </div>

                <!-- Current Delivery Status Tracker -->
                <div class="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Current Trip Stage:</span>
                    <span class="px-2 py-0.5 rounded text-xs font-bold font-mono-code ${isPumping ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-sky-950 text-sky-300 border border-sky-700'}">
                      ${driverStatus}
                    </span>
                  </div>

                  <!-- Quick Stage Actions -->
                  <div class="grid grid-cols-2 gap-2 mt-3">
                    <button onclick="window.updateDriverOrderStatus('${lead.id}', 'In Transit / En Route')" class="py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-sky-500 text-xs font-semibold text-slate-200 transition">
                      🚚 1. En Route
                    </button>
                    <button onclick="window.updateDriverOrderStatus('${lead.id}', 'At Customer Inlet / Pumping')" class="py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-sky-500 text-xs font-semibold text-slate-200 transition">
                      🚰 2. At Inlet (Pumping)
                    </button>
                  </div>
                </div>

                <!-- Complete & Close Primary Button -->
                <button onclick="window.openClosureModal('${lead.id}')" class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  <span>✅ Complete & Close Order</span>
                </button>

                <!-- Navigation & Call Actions -->
                <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                    <span>🗺️ GPS Route</span>
                  </a>
                  <a href="tel:+91${lead.phone}" class="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                    <span>📞 Call</span>
                  </a>
                  <a href="https://wa.me/91${lead.phone}?text=${encodeURIComponent(`Hello ${lead.customerName}, Tanker Buddy driver ${currentDriver.name} is on the way with your water order ${lead.id} in vehicle ${currentDriver.vehicleNo}.`)}" target="_blank" rel="noopener noreferrer" class="py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                    <span>💬 WhatsApp</span>
                  </a>
                </div>
              </div>
            `;
          }).join("");
        }
      }

      // 3. Render Completed Deliveries Grid
      const completedGrid = document.getElementById("driver-completed-orders-grid");
      if (completedGrid) {
        if (completedOrders.length === 0) {
          completedGrid.innerHTML = `
            <div class="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <div class="w-12 h-12 mx-auto rounded-full bg-emerald-950/80 border border-emerald-600/60 flex items-center justify-center text-emerald-400 mb-3 text-xl">✓</div>
              <h4 class="text-white font-semibold text-sm">No Completed Orders Yet Today</h4>
              <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">When you finish pumping water and click "Complete & Close Order", delivery flow logs and proof receipts will appear here.</p>
            </div>
          `;
        } else {
          completedGrid.innerHTML = completedOrders.map(lead => {
            const deliveredDateStr = lead.deliveredAt ? new Date(lead.deliveredAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Today";
            return `
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span class="font-mono-code text-xs font-bold text-sky-400">${lead.id}</span>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">DELIVERED</span>
                </div>

                <div>
                  <h4 class="font-bold text-white text-sm">${lead.customerName}</h4>
                  <p class="text-xs text-slate-300">${lead.address}</p>
                </div>

                <div class="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div class="flex justify-between text-slate-300">
                    <span>Delivered Time:</span>
                    <strong class="font-mono-code text-slate-100">${deliveredDateStr}</strong>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>Volume Pumped:</span>
                    <strong class="font-mono-code text-cyan-300">${(parseInt(lead.volumeLiters) || 0).toLocaleString("en-IN")} L</strong>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>Meter End Reading:</span>
                    <span class="font-mono-code text-slate-200">${lead.flowMeterEnd || 'Recorded'}</span>
                  </div>
                  <div class="flex justify-between text-slate-400 text-[11px]">
                    <span>Payment:</span>
                    <span class="text-emerald-400">${lead.paymentStatus || 'Verified'}</span>
                  </div>
                </div>
              </div>
            `;
          }).join("");
        }
      }
    }

    // Expose Global Handlers for Driver Actions
    window.claimOrderForDriver = async function(id) {
      const activeDriver = getActiveDriver();
      await TankerDB.claimOrder(id, activeDriver);
      showToast(`Order ${id} claimed by ${activeDriver.name}! Moved to My Active Deliveries.`, "success");
      
      const activeTabBtn = document.getElementById("driver-tab-btn-active");
      activeTabBtn?.click();
      renderDriverDashboard();
    };

    window.updateDriverOrderStatus = async function(id, newStatus) {
      await TankerDB.updateDriverStatus(id, newStatus, state.driver.gps);
      showToast(`Status updated to: "${newStatus}"`, "info");
      renderDriverDashboard();
    };

    window.openClosureModal = async function(id) {
      const allLeads = await TankerDB.getAllLeads();
      const lead = allLeads.find(l => l.id === id);
      if (!lead) return;

      document.getElementById("closure-order-id").value = lead.id;
      document.getElementById("closure-ref-display").textContent = lead.id;
      document.getElementById("closure-customer-display").textContent = lead.customerName;
      document.getElementById("closure-volume-display").textContent = `${lead.volumeLiters}L • ${lead.treatmentLabel || lead.treatment}`;
      document.getElementById("closure-address-display").textContent = lead.address;
      document.getElementById("closure-meter-reading").value = `${(142500 + (parseInt(lead.volumeLiters) || 6000)).toLocaleString("en-IN")} L`;

      const stampEl = document.getElementById("closure-gps-stamp");
      if (stampEl) {
        stampEl.textContent = `Coordinates: ${state.driver.gps.lat}° N, ${state.driver.gps.lng}° E • Accuracy: ±${state.driver.gps.accuracy}m • Timestamp: ${new Date().toLocaleTimeString("en-IN")}`;
      }

      closureModal?.classList.remove("hidden");
    };

    closureCloseBtn?.addEventListener("click", () => closureModal?.classList.add("hidden"));
    closureCancelBtn?.addEventListener("click", () => closureModal?.classList.add("hidden"));

    closureForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const orderId = document.getElementById("closure-order-id").value;
      const meterReading = document.getElementById("closure-meter-reading").value.trim();
      const paymentStatus = document.getElementById("closure-payment-status").value;
      const notes = document.getElementById("closure-notes").value.trim();

      const closureData = {
        meterReading: meterReading,
        paymentStatus: paymentStatus,
        notes: notes,
        gps: state.driver.gps,
        inletVerified: true
      };

      await TankerDB.closeOrder(orderId, closureData);
      closureModal?.classList.add("hidden");
      closureForm.reset();
      showToast(`Order ${orderId} successfully completed & closed! Water delivered.`, "success");

      const completedTabBtn = document.getElementById("driver-tab-btn-completed");
      completedTabBtn?.click();
      renderDriverDashboard();
    });

    // Subscribe to DB changes so driver cockpit stays synchronized with new orders
    TankerDB.subscribe(() => {
      if (state.driver.isAuthenticated) {
        renderDriverDashboard();
      }
    });
  }

  // 12. Mobile Drawer Navigation
  function setupMobileNav() {
    const mobileBtn = document.getElementById("mobile-menu-toggle");
    const mobileDrawer = document.getElementById("mobile-drawer");
    const mobileClose = document.getElementById("mobile-drawer-close");

    mobileBtn?.addEventListener("click", () => mobileDrawer?.classList.remove("hidden"));
    mobileClose?.addEventListener("click", () => mobileDrawer?.classList.add("hidden"));

    document.querySelectorAll(".mobile-nav-link").forEach(link => {
      link.addEventListener("click", () => mobileDrawer?.classList.add("hidden"));
    });
  }

  // 13. Official Business WhatsApp Account & Dashboard Operations
  function setupBusinessWhatsApp() {
    const waSection = document.getElementById("whatsapp-section");
    const waCloseBtn = document.getElementById("whatsapp-section-close-btn");
    const modal = document.getElementById("business-wa-modal");
    const modalCloseBtn = document.getElementById("business-wa-modal-close");
    const navBtn = document.getElementById("business-wa-nav-btn");
    const mobileBtn = document.getElementById("business-wa-mobile-btn");
    const dockBtn = document.getElementById("business-wa-dock-btn");
    const adminBtn = document.getElementById("admin-bwa-btn");
    const navStatus = document.getElementById("nav-business-wa-status");
    const adminBadge = document.getElementById("admin-bwa-badge");

    // Modal elements
    const modalForm = document.getElementById("business-wa-form");
    const modalInput = document.getElementById("business-wa-input");
    const modalCurrentDisplay = document.getElementById("bwa-modal-current-display");
    const modalTestLink = document.getElementById("bwa-direct-test-link");

    // Section Dashboard elements
    const dashPhoneDisplay = document.getElementById("wa-dash-phone-display");
    const dashTestBtn = document.getElementById("wa-dash-test-btn");
    const dashUpdateForm = document.getElementById("wa-dash-update-form");
    const dashInputPhone = document.getElementById("wa-dash-input-phone");
    const dashUseLeadBtn = document.getElementById("wa-dash-use-lead-phone-btn");
    const quickMsgForm = document.getElementById("wa-quick-message-form");
    const quickPhone = document.getElementById("wa-quick-phone");
    const quickText = document.getElementById("wa-quick-text");
    const ordersTbody = document.getElementById("wa-dash-orders-tbody");
    const orderCountBadge = document.getElementById("wa-dash-order-count");

    async function getActiveBusinessNumber() {
      let num = localStorage.getItem("tanker_buddy_business_whatsapp");
      if (!num) {
        const leads = await TankerDB.getAllLeads();
        if (leads && leads.length > 0 && leads[0].phone) {
          num = String(leads[0].phone).replace(/\D/g, "").slice(-10);
          localStorage.setItem("tanker_buddy_business_whatsapp", num);
        }
      }
      return num || "";
    }

    async function updateUiDisplays() {
      const num = await getActiveBusinessNumber();
      const allLeads = await TankerDB.getAllLeads();

      if (num) {
        if (modalCurrentDisplay) modalCurrentDisplay.textContent = `+91 ${num}`;
        if (dashPhoneDisplay) dashPhoneDisplay.textContent = `+91 ${num}`;
        if (adminBadge) adminBadge.textContent = `+91 ${num}`;
        if (modalInput && !modalInput.value) modalInput.value = num;
        if (dashInputPhone && !dashInputPhone.value) dashInputPhone.value = num;
        
        const testUrl = `https://wa.me/91${num}?text=${encodeURIComponent("Hello Tanker Buddy Bengaluru Dispatch! Testing verified Business WhatsApp link.")}`;
        if (modalTestLink) {
          modalTestLink.href = testUrl;
          modalTestLink.classList.remove("pointer-events-none", "opacity-50");
        }
        if (dashTestBtn) {
          dashTestBtn.href = testUrl;
          dashTestBtn.classList.remove("pointer-events-none", "opacity-50");
        }
        if (navStatus) {
          navStatus.className = "w-2 h-2 rounded-full bg-emerald-400";
        }
      } else {
        if (modalCurrentDisplay) modalCurrentDisplay.textContent = "Not Configured Yet";
        if (dashPhoneDisplay) dashPhoneDisplay.textContent = "Not Configured Yet";
        if (adminBadge) adminBadge.textContent = "Setup Required";
        if (modalTestLink) {
          modalTestLink.href = "#";
          modalTestLink.classList.add("pointer-events-none", "opacity-50");
        }
        if (dashTestBtn) {
          dashTestBtn.href = "#";
          dashTestBtn.classList.add("pointer-events-none", "opacity-50");
        }
        if (navStatus) {
          navStatus.className = "w-2 h-2 rounded-full bg-amber-400";
        }
      }

      // Render Orders Queue in WhatsApp Dashboard
      if (orderCountBadge) orderCountBadge.textContent = `${allLeads.length} Orders in Queue`;
      if (ordersTbody) {
        if (allLeads.length === 0) {
          ordersTbody.innerHTML = `
            <tr>
              <td colspan="6" class="px-6 py-10 text-center text-slate-400">
                <div class="max-w-md mx-auto">
                  <div class="w-10 h-10 mx-auto rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 text-lg mb-2">💬</div>
                  <h4 class="text-white font-semibold text-xs">Zero Orders in WhatsApp Queue</h4>
                  <p class="text-[11px] text-slate-500 mt-1">When customer bookings or RWA inquiries are placed, they appear here live with 1-click WhatsApp messaging.</p>
                </div>
              </td>
            </tr>
          `;
        } else {
          ordersTbody.innerHTML = allLeads.map(lead => {
            const dateStr = lead.timestamp ? new Date(lead.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Today";
            const cleanPhone = String(lead.phone || "").replace(/\D/g, "").slice(-10);
            
            const waReceiptUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${lead.customerName}! Tanker Buddy Dispatch confirming your water order *${lead.id}*. Volume: ${lead.volumeLabel}, Grade: ${lead.treatmentLabel}, Delivery Address: ${lead.address}, Total Payable: ₹${lead.estimatedPrice}.`)}`;
            const waDriverUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${lead.customerName}! Your Tanker Buddy driver has been assigned and is heading towards your location for delivery of ${lead.volumeLabel}.`)}`;

            return `
              <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">
                <td class="px-4 py-3 font-mono-code text-slate-300">
                  <span class="text-sky-400 font-bold block">${lead.id}</span>
                  <span class="text-[10px] text-slate-500">${dateStr}</span>
                </td>
                <td class="px-4 py-3 font-semibold text-white">
                  ${lead.customerName}
                  <span class="block text-[10px] text-slate-400 font-normal">${lead.representativeName || lead.customerName}</span>
                </td>
                <td class="px-4 py-3 font-mono-code text-emerald-400 font-bold">
                  +91 ${cleanPhone}
                </td>
                <td class="px-4 py-3 text-slate-300">
                  <strong class="font-mono-code text-white">${lead.volumeLiters}L</strong>
                  <span class="block text-[10px] text-slate-400">${lead.treatmentLabel || lead.treatment}</span>
                </td>
                <td class="px-4 py-3 font-mono-code font-bold text-white">
                  ₹${(lead.estimatedPrice || 0).toLocaleString("en-IN")}
                </td>
                <td class="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                  <a href="${waReceiptUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-semibold text-[11px] transition" title="Send Receipt">
                    <span>📱 Send Receipt</span>
                  </a>
                  <a href="${waDriverUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-700 text-sky-300 font-semibold text-[11px] transition" title="Send Driver Alert">
                    <span>🚚 Driver Alert</span>
                  </a>
                </td>
              </tr>
            `;
          }).join("");
        }
      }
    }

    function openWhatsAppDashboard() {
      waSection?.classList.remove("hidden");
      waSection?.scrollIntoView({ behavior: "smooth" });
      updateUiDisplays();
      showToast("WhatsApp Operations & Dispatch Dashboard opened.", "success");
    }

    function closeWhatsAppDashboard() {
      waSection?.classList.add("hidden");
    }

    function openModal() {
      updateUiDisplays();
      modal?.classList.remove("hidden");
      modalInput?.focus();
    }

    function closeModal() {
      modal?.classList.add("hidden");
    }

    window.openWhatsAppDashboard = openWhatsAppDashboard;
    window.closeWhatsAppDashboard = closeWhatsAppDashboard;
    window.openBusinessWhatsAppModal = openModal;
    window.closeBusinessWhatsAppModal = closeModal;

    // Navigation and button click triggers: Open the WhatsApp Dashboard directly!
    navBtn?.addEventListener("click", openWhatsAppDashboard);
    mobileBtn?.addEventListener("click", () => {
      document.getElementById("mobile-drawer")?.classList.add("hidden");
      openWhatsAppDashboard();
    });
    dockBtn?.addEventListener("click", openWhatsAppDashboard);
    adminBtn?.addEventListener("click", openWhatsAppDashboard);
    waCloseBtn?.addEventListener("click", closeWhatsAppDashboard);

    modalCloseBtn?.addEventListener("click", closeModal);
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // Save number handler for Dashboard Section
    dashUpdateForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = dashInputPhone.value.replace(/\D/g, "").slice(-10);
      if (!/^[6-9]\d{9}$/.test(val)) {
        showToast("Please enter a valid 10-digit Indian WhatsApp mobile number.", "error");
        return;
      }
      localStorage.setItem("tanker_buddy_business_whatsapp", val);
      updateUiDisplays();
      showToast(`Business WhatsApp updated to +91 ${val}!`, "success");
    });

    // Save number handler for Modal
    modalForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = modalInput.value.replace(/\D/g, "").slice(-10);
      if (!/^[6-9]\d{9}$/.test(val)) {
        showToast("Please enter a valid 10-digit Indian WhatsApp mobile number.", "error");
        return;
      }
      localStorage.setItem("tanker_buddy_business_whatsapp", val);
      updateUiDisplays();
      showToast(`Business WhatsApp set to +91 ${val}!`, "success");
      closeModal();
    });

    // "Use Latest" button helper
    dashUseLeadBtn?.addEventListener("click", async () => {
      const leads = await TankerDB.getAllLeads();
      if (leads && leads.length > 0 && leads[0].phone) {
        const val = String(leads[0].phone).replace(/\D/g, "").slice(-10);
        localStorage.setItem("tanker_buddy_business_whatsapp", val);
        if (dashInputPhone) dashInputPhone.value = val;
        updateUiDisplays();
        showToast(`Business WhatsApp set to your latest customer number: +91 ${val}`, "success");
      } else {
        showToast("No recent bookings found. Please enter your 10-digit number.", "info");
      }
    });

    // Quick direct messenger form
    quickMsgForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const phone = quickPhone.value.replace(/\D/g, "").slice(-10);
      const text = quickText.value.trim();
      if (!/^[6-9]\d{9}$/.test(phone)) {
        showToast("Please enter a valid 10-digit Indian mobile number to message.", "error");
        return;
      }
      const msgUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(text || "Hello from Tanker Buddy Bengaluru Dispatch.")}`;
      window.open(msgUrl, "_blank", "noopener,noreferrer");
      quickText.value = "";
    });

    // Initial update
    updateUiDisplays();
    TankerDB.subscribe(() => {
      updateUiDisplays();
      renderHubOperationsBoard();
    });
  }

  // Initialize all controllers
  setupHouseholdForm();
  setupRwaForm();
  setupPricingCalculatorSection();
  setupSumpSimulator();
  setupLabReports();
  setupAdminDashboard();
  setupDriverDashboard();
  setupBusinessWhatsApp();
  renderHubOperationsBoard();
  setupMobileNav();

  // Set default segment
  setSegment("household");
});
