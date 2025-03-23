const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);
    
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            console.log("Conexão fechada, tentando reconectar...");
            connectToWhatsApp();
        } else if (connection === "open") {
            console.log("Conectado ao WhatsApp!");
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && msg.message) {
            const text = msg.message.conversation || "";
            console.log(`Mensagem recebida: ${text}`);

            if (text.toLowerCase() === "oi") {
                await sock.sendMessage(msg.key.remoteJid, { text: "Olá! Como posso ajudar?" });
            }
        }
    });
}

connectToWhatsApp();
