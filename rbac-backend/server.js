// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
// import connectDB from "./config/db.js";
// import { initSocket } from "./sockets/index.js";
// import authRoutes from "./routes/auth.routes.js";
// import organizationRoutes from "./routes/organization.routes.js";
// import scopeRoutes from "./routes/scope.routes.js";
// import moduleRoutes from "./routes/module.routes.js";
// import roleRoutes from "./routes/role.routes.js";
// import staffRoutes from "./routes/staff.routes.js";

// dotenv.config();
// connectDB();

// const app = express();
// const server = http.createServer(app);

// /* ========== SOCKET.IO SETUP ========== */
// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL,
//     credentials: true,
//   },
// });

// /* io ko app object me store karo — kisi bhi controller me
//    req.app.get("io") se access ho jaayega, alag import ki zaroorat nahi */
// app.set("io", io);

// initSocket(io); // socket connection + auth handling yahan se setup hoga

// /* ========== CORE MIDDLEWARE ========== */
// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// app.use(express.json());
// app.use(cookieParser());

// /* ========== HEALTH CHECK ========== */
// app.get("/", (req, res) => {
//   res.json({ success: true, message: "RBAC Backend is running" });
// });

// /* ========== ROUTES ==========
//    Abhi khali hai — jaise-jaise controllers/routes banayenge,
//    yahan register karte jaayenge. Example (aage aayega):
//    app.use("/api/auth", authRoutes);
//    app.use("/api/organizations", organizationRoutes);
//    app.use("/api/roles", roleRoutes);
//    app.use("/api/permissions", permissionRoutes);
// */

// app.use("/api/organizations", organizationRoutes);
// app.use("/api/scopes", scopeRoutes);
// app.use("/api/auth", authRoutes);

// app.use("/api/modules", moduleRoutes);
// app.use("/api/roles", roleRoutes);

// app.use("/api/staff", staffRoutes);
// /* ========== 404 HANDLER ========== */
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: "Route not found" });
// });

// /* ========== GLOBAL ERROR HANDLER ========== */
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



///////////////////////////////  protect middleware ke liye socket.io ka setup  ///////////////////////////////

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import { initSocket } from "./sockets/index.js";
import { sanitizeMiddleware } from "./middleware/sanitize.js";

import authRoutes from "./routes/auth.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import scopeRoutes from "./routes/scope.routes.js";
import moduleRoutes from "./routes/module.routes.js";
import roleRoutes from "./routes/role.routes.js";
import staffRoutes from "./routes/staff.routes.js";

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});
app.set("io", io);
initSocket(io);

/* ========== SECURITY MIDDLEWARE ========== */
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(sanitizeMiddleware);

/* ========== RATE LIMITING ========== */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/forgot-password-otp", authLimiter);
app.use("/api/auth/verify-otp", authLimiter);
app.use("/api/auth/reset-password-otp", authLimiter);
app.use("/api/auth/reset-password", authLimiter);

/* ========== ROUTES ========== */
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/scopes", scopeRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/staff", staffRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "RBAC Backend is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





