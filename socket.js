const { db } = require("./firebaseAdmin");

function setupSocket(io) {
  io.on("connection", (socket) => {

    socket.on("joinRoom", ({ userId }) => {
      if (!userId) return;
      socket.join(userId);
    });

    socket.on("sendMessage", async ({ fromId, toId, text }) => {
      if (!fromId || !toId || !text) {
        console.warn("⚠️ sendMessage missing params", { fromId, toId, text });
        return;
      }

      const msg = {
        senderId: fromId,
        receiverId: toId,
        message: text,
        createdAt: Date.now(),
      };

      try {
        const docRef = await db.collection("chats").add(msg);
        const savedMsg = { id: docRef.id, ...msg };
        console.log("📤 Message saved:", savedMsg);

        io.to(fromId).emit("newMessage", savedMsg);
        io.to(toId).emit("newMessage", savedMsg);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("loadHistory", async ({ user1, user2 }) => {
      if (!user1 || !user2) return;

      try {
        const snap = await db
          .collection("chats")
          .where("senderId", "in", [user1, user2])
          .get();

        const messages = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter(
            (m) =>
              (m.senderId === user1 && m.receiverId === user2) ||
              (m.senderId === user2 && m.receiverId === user1)
          )
          .sort((a, b) => a.createdAt - b.createdAt);

        socket.emit("history", messages);
      } catch (err) {
        console.error(err);
      }
    });

  });
}

module.exports = setupSocket;
