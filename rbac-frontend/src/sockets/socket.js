import { io } from "socket.io-client";

/* =====================================================
   SOCKET.IO CLIENT — singleton instance
   Poore app me ek hi socket-connection use hota hai.
   Login hone ke baad `connectSocket(userId)` call karo
   (AuthContext ya Login page se), logout pe `disconnectSocket()`.
===================================================== */
let socket = null;

export const connectSocket = (userId) => {
  if (!userId) return null;

  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      autoConnect: true,
    });
  }

  socket.on("connect", () => {
    socket.emit("register", userId);
  });

  /* ========== GLOBAL LISTENERS ========== */

  /* Jab is user ki permission kisi ne update ki ho */
  socket.on("permission:updated", () => {
    window.dispatchEvent(new Event("permission-updated"));
  });

  /* Jab is user ko force-logout kiya gaya ho (superAdmin se ya deactivate se) */
  socket.on("auth:forceLoggedOut", (data) => {
    window.dispatchEvent(new CustomEvent("force-logout", { detail: data }));
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
