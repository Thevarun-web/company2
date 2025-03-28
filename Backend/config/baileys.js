const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto"); // ✅ FIX: Import crypto
global.crypto = crypto; // ✅ FIX: Assign it globally

const sessionFolder = path.join(__dirname, "../auth_info");

async function startWhatsApp() {
    try {
        if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            browser: ["Ubuntu", "Chrome", "22.04.4"],
        });

        sock.ev.on("creds.update", saveCreds);

        return new Promise((resolve, reject) => {
            sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
                if (connection === "open") {
                    console.log("✅ WhatsApp Connected!");
                    resolve(sock);
                } else if (connection === "close") {
                    console.log("🔄 Reconnecting...");
                    startWhatsApp();
                } else {
                    console.log("🔴 Connection update:", connection);
                }
            });

            // ✅ FIX: Increase timeout for better stability
            setTimeout(() => reject(new Error("WhatsApp session initialization timeout!")), 60000);
        });
    } catch (error) {
        console.error("❌ Error starting WhatsApp:", error.message);
        throw error;
    }
}

module.exports = startWhatsApp;
