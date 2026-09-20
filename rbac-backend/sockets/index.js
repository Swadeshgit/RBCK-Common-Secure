/* =====================================================
   SOCKET.IO — CENTRAL SETUP
   Har connected user apne khud ke room me join hota hai
   (userId based) — isse kisi ek user ko target karke
   event bhejna easy ho jaata hai (jaise: permission update,
   force-logout) bina baaki sab users ko disturb kiye.
===================================================== */
export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    /* Frontend connect hote hi turant apna userId bhejega
       taaki hum usko uske personal room me daal sakein */
    socket.on("register", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

/* Helper — kisi bhi controller se ek specific user ko
   event bhejne ke liye. Usage:
   emitToUser(req.app.get("io"), userId, "permission:updated", data)
*/
export const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};
