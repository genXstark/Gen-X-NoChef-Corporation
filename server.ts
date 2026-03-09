import express from "express";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import fetch from "node-fetch";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// In Node.js (CJS and tsx ESM), __dirname is available.
// If it's not (pure ESM), we'd need a fallback, but tsx and tsc-to-cjs handle it.
declare const __dirname: string;
const _dirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

// Initialize Firebase Admin safely
let db: admin.firestore.Firestore | null = null;
try {
  if (!admin.apps.length) {
    // If we have VITE_FIREBASE_PROJECT_ID, we can try to initialize with it
    // but usually firebase-admin needs a service account or ADC.
    // We'll try default initialization first.
    admin.initializeApp();
  }
  db = admin.firestore();
} catch (error) {
  console.error("Firebase Admin initialization failed:", error);
}

async function startServer() {
  const app = express();
  app.use(express.json());
  
  // Use process.env.PORT for Hostinger
  const PORT = process.env.PORT || 3000;

  // Helper to get API settings
  async function getApiSettings() {
    if (!db) return null;
    try {
      const configDoc = await db.collection('config').doc('apiSettings').get();
      if (!configDoc.exists) {
        return {
          panelBaseUrl: 'https://activationpanel.net/api/api.php',
          apiKey: '',
          panelUsername: '',
          panelPassword: ''
        };
      }
      return configDoc.data();
    } catch (e) {
      console.error("Error fetching API settings:", e);
      return null;
    }
  }

  // API routes
  app.post("/api/provision", async (req, res) => {
    try {
      const { type, identifier, sub, pack, resellerUid } = req.body;
      const settings = await getApiSettings();
      
      if (!settings?.apiKey) throw new Error("API Key not configured or Firebase error");

      const params = new URLSearchParams({
        action: type === 'mag' ? 'add_mag' : 'add_m3u',
        api_key: settings.apiKey,
        username: settings.panelUsername,
        password: settings.panelPassword,
        mac: type === 'mag' ? identifier : '',
        m3u_username: type === 'm3u' ? identifier : '',
        package: pack,
        duration: sub
      });

      const response = await fetch(`${settings.panelBaseUrl}?${params.toString()}`, { method: 'POST' });
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ status: "false", message: error.message });
    }
  });

  app.post("/api/renew", async (req, res) => {
    try {
      const { type, identifier, sub, resellerUid } = req.body;
      const settings = await getApiSettings();
      
      if (!settings?.apiKey) throw new Error("API Key not configured or Firebase error");

      const params = new URLSearchParams({
        action: 'renew',
        api_key: settings.apiKey,
        username: settings.panelUsername,
        password: settings.panelPassword,
        identifier: identifier,
        type: type,
        duration: sub
      });

      const response = await fetch(`${settings.panelBaseUrl}?${params.toString()}`, { method: 'POST' });
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ status: "false", message: error.message });
    }
  });

  app.post("/api/packages", async (req, res) => {
    try {
      const settings = await getApiSettings();
      if (!settings?.apiKey) throw new Error("API Key not configured or Firebase error");

      const params = new URLSearchParams({
        action: 'get_packages',
        api_key: settings.apiKey,
        username: settings.panelUsername,
        password: settings.panelPassword
      });

      const response = await fetch(`${settings.panelBaseUrl}?${params.toString()}`, { method: 'POST' });
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ status: "false", message: error.message });
    }
  });

  app.post("/api/reseller-info", async (req, res) => {
    try {
      const settings = await getApiSettings();
      if (!settings?.apiKey) throw new Error("API Key not configured or Firebase error");

      const params = new URLSearchParams({
        action: 'get_reseller_info',
        api_key: settings.apiKey,
        username: settings.panelUsername,
        password: settings.panelPassword
      });

      const response = await fetch(`${settings.panelBaseUrl}?${params.toString()}`, { method: 'POST' });
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ status: "false", message: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(_dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(_dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
