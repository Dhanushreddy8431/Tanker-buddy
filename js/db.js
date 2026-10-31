/**
 * Tanker Buddy — Bangalore's Water Infrastructure Platform
 * Persistent Data Layer: IndexedDB with LocalStorage Fallback & Firestore Hook
 */

const TankerDB = (function() {
  const DB_NAME = "TankerBuddyBLR_DB";
  const DB_VERSION = 1;
  const STORE_NAME = "leads";
  const LOCAL_STORAGE_KEY = "tanker_buddy_leads_v1";

  let dbInstance = null;
  const listeners = [];

  function notifyChange() {
    getAllLeads().then(leads => {
      listeners.forEach(cb => {
        try { cb(leads); } catch(err) { console.error("Error in DB listener:", err); }
      });
    });
  }

  // Open IndexedDB
  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn("IndexedDB not supported, falling back to LocalStorage.");
        resolve(null);
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("status", "status", { unique: false });
          store.createIndex("cluster", "cluster", { unique: false });
        }
      };

      request.onsuccess = function(e) {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };

      request.onerror = function(e) {
        console.error("IndexedDB error:", e);
        resolve(null); // Fallback to localStorage
      };
    });
  }

  // LocalStorage Helpers
  function getFromLocalStorage() {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("LocalStorage read error:", e);
      return null;
    }
  }

  function saveToLocalStorage(leads) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error("LocalStorage write error:", e);
    }
  }

  // Initialize DB (Zero fake mock data, genuine data only)
  async function init() {
    await openDatabase();
    const existing = await getAllLeads();
    
    // Aggressively purge legacy fake mock leads if present in local cache
    const fakeMockIds = ["TB-BLR-2026-1001", "TB-BLR-2026-1002", "TB-BLR-2026-1003", "TB-BLR-2026-1004", "TB-BLR-2026-1005", "TB-BLR-2026-1006", "TB-BLR-2026-1007"];
    const fakeNames = ["Vikram Sethi", "Aditya Sharma", "Prestige Lakeside Habitat", "Kavitha Reddy", "Rajesh Nair", "Sobha Dream Acres", "Divya Sundaram"];
    if (existing && existing.length > 0) {
      for (const l of existing) {
        if (fakeMockIds.includes(l.id) || fakeNames.some(fn => (l.customerName || "").includes(fn))) {
          await deleteLead(l.id);
        }
      }
    }
    notifyChange();
    checkFirestoreHook();
    return true;
  }

  // Clear All Leads (Purge fake/mock data and reset to completely clean state)
  function clearAllLeads() {
    return new Promise(async (resolve) => {
      saveToLocalStorage([]);
      if (dbInstance) {
        try {
          const tx = dbInstance.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          store.clear();
          tx.oncomplete = () => {
            notifyChange();
            resolve(true);
          };
          tx.onerror = () => {
            notifyChange();
            resolve(true);
          };
        } catch (e) {
          console.warn("Clear IDB error:", e);
          notifyChange();
          resolve(true);
        }
      } else {
        notifyChange();
        resolve(true);
      }
    });
  }

  // Get All Leads
  function getAllLeads() {
    return new Promise((resolve) => {
      if (dbInstance) {
        try {
          const tx = dbInstance.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const request = store.getAll();
          request.onsuccess = function() {
            let res = request.result || [];
            // Sort newest first
            res.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            resolve(res);
          };
          request.onerror = function() {
            // fallback
            const ls = getFromLocalStorage() || [];
            ls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            resolve(ls);
          };
        } catch (e) {
          const ls = getFromLocalStorage() || [];
          ls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          resolve(ls);
        }
      } else {
        const ls = getFromLocalStorage() || [];
        ls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(ls);
      }
    });
  }

  // Generate Reference ID
  function generateReferenceId(type = "lead") {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `TB-BLR-2026-${randomHex}`;
  }

  // Save Lead (Create or Update)
  function saveLead(leadData, notify = true) {
    return new Promise(async (resolve, reject) => {
      if (!leadData.id) {
        leadData.id = generateReferenceId(leadData.customerType || "lead");
      }
      if (!leadData.timestamp) {
        leadData.timestamp = new Date().toISOString();
      }
      if (!leadData.status) {
        leadData.status = "New Lead";
      }

      // 1. Save to LocalStorage as mirror backup
      const lsLeads = getFromLocalStorage() || [];
      const idx = lsLeads.findIndex(l => l.id === leadData.id);
      if (idx >= 0) {
        lsLeads[idx] = leadData;
      } else {
        lsLeads.unshift(leadData);
      }
      saveToLocalStorage(lsLeads);

      // 2. Save to IndexedDB if available
      if (dbInstance) {
        try {
          const tx = dbInstance.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          store.put(leadData);
          tx.oncomplete = () => {
            syncToFirestoreIfAvailable(leadData);
            if (notify) notifyChange();
            resolve(leadData);
          };
          tx.onerror = (e) => {
            console.warn("IndexedDB put error, saved to LS:", e);
            if (notify) notifyChange();
            resolve(leadData);
          };
        } catch(e) {
          if (notify) notifyChange();
          resolve(leadData);
        }
      } else {
        syncToFirestoreIfAvailable(leadData);
        if (notify) notifyChange();
        resolve(leadData);
      }
    });
  }

  // Update Status
  async function updateLeadStatus(id, newStatus) {
    const leads = await getAllLeads();
    const lead = leads.find(l => l.id === id);
    if (!lead) return false;
    lead.status = newStatus;
    lead.lastUpdated = new Date().toISOString();
    await saveLead(lead, true);
    return true;
  }

  // Delete Lead
  function deleteLead(id) {
    return new Promise(async (resolve) => {
      // LocalStorage
      let lsLeads = getFromLocalStorage() || [];
      lsLeads = lsLeads.filter(l => l.id !== id);
      saveToLocalStorage(lsLeads);

      if (dbInstance) {
        try {
          const tx = dbInstance.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          store.delete(id);
          tx.oncomplete = () => {
            notifyChange();
            resolve(true);
          };
          tx.onerror = () => {
            notifyChange();
            resolve(true);
          };
        } catch(e) {
          notifyChange();
          resolve(true);
        }
      } else {
        notifyChange();
        resolve(true);
      }
    });
  }

  // Reset to Demo Seed Data
  async function resetToDemo() {
    const seedData = (window.TANKER_BUDDY_DATA && window.TANKER_BUDDY_DATA.seedLeads) || [];
    saveToLocalStorage(seedData);

    if (dbInstance) {
      try {
        const tx = dbInstance.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        for (const lead of seedData) {
          store.put(lead);
        }
      } catch (e) {
        console.warn("Reset IDB error:", e);
      }
    }
    notifyChange();
    return true;
  }

  // Subscribe to changes
  function subscribe(callback) {
    if (typeof callback === "function") {
      listeners.push(callback);
    }
  }

  // CSV Export Utility
  async function exportLeadsToCSV() {
    const leads = await getAllLeads();
    if (!leads || leads.length === 0) {
      alert("No leads available to export.");
      return;
    }

    const headers = [
      "Reference ID",
      "Timestamp",
      "Customer / RWA Name",
      "Customer Type",
      "Contact Person",
      "Phone Number",
      "Email Address",
      "Bengaluru Cluster",
      "Delivery Address",
      "Volume (Liters)",
      "Water Source",
      "Treatment Grade",
      "Frequency",
      "Delivery Window",
      "Hose Length",
      "IoT Sensor Requested",
      "Estimated Cost (INR)",
      "Status",
      "Driver Notes"
    ];

    const rows = leads.map(l => [
      l.id || "",
      l.timestamp ? new Date(l.timestamp).toLocaleString("en-IN") : "",
      `"${(l.customerName || "").replace(/"/g, '""')}"`,
      l.customerType || "",
      `"${(l.representativeName || "").replace(/"/g, '""')}"`,
      l.phone || "",
      l.email || "",
      l.cluster || "",
      `"${(l.address || "").replace(/"/g, '""')}"`,
      l.volumeLiters || "",
      `"${(l.sourceLabel || l.source || "").replace(/"/g, '""')}"`,
      `"${(l.treatmentLabel || l.treatment || "").replace(/"/g, '""')}"`,
      l.frequency || "",
      `"${(l.deliveryWindow || "").replace(/"/g, '""')}"`,
      `"${(l.hoseLength || "").replace(/"/g, '""')}"`,
      l.sensorRequested ? "YES" : "NO",
      l.estimatedPrice || "",
      l.status || "New Lead",
      `"${(l.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `TankerBuddy_BLR_Leads_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Firestore Integration Hook (Optional Cloud Sync)
  function checkFirestoreHook() {
    if (window.TANKER_BUDDY_FIREBASE_CONFIG && window.firebase) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(window.TANKER_BUDDY_FIREBASE_CONFIG);
        }
        console.log("Tanker Buddy: Firestore cloud bridge initialized.");
      } catch (e) {
        console.warn("Tanker Buddy: Firestore init warning:", e);
      }
    }
  }

  function syncToFirestoreIfAvailable(lead) {
    if (window.firebase && firebase.apps.length && firebase.firestore) {
      try {
        const db = firebase.firestore();
        db.collection("tanker_buddy_leads").doc(lead.id).set(lead, { merge: true })
          .then(() => console.log("Lead synced to Firestore:", lead.id))
          .catch(e => console.warn("Firestore sync error:", e));
      } catch (err) {
        console.warn("Firestore sync caught:", err);
      }
    }
  }

  return {
    init,
    getAllLeads,
    saveLead,
    updateLeadStatus,
    deleteLead,
    resetToDemo,
    clearAllLeads,
    subscribe,
    exportLeadsToCSV
  };
})();

// Make global
window.TankerDB = TankerDB;
