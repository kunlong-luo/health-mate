import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import cors from "cors";

import reportsRouter from "./src/server/api/reports";
import settingsRouter from "./src/server/api/settings";
import authRouter from "./src/server/api/auth";
import familyRouter from "./src/server/api/family";
import notesRouter from "./src/server/api/notes";
import migrateRouter from "./src/server/api/migrate";
import visitsRouter from "./src/server/api/visits";
import medicationsRouter from "./src/server/api/medications";
import chatRouter from "./src/server/api/chat";
import notificationsRouter from "./src/server/api/notifications";
import careRemindersRouter from "./src/server/api/care-reminders";
import { initProactiveAgent } from "./src/server/agent/proactive";

// Environment setup for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.use('/api/reports', reportsRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/family', familyRouter);
  app.use('/api/notes', notesRouter);
  app.use('/api/migrate', migrateRouter);
  app.use('/api/visits', visitsRouter);
  app.use('/api/medications', medicationsRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/care-reminders', careRemindersRouter);

  // Init Background Jobs
  initProactiveAgent();

  // Start Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
