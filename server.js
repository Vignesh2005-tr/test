import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import { Client, GatewayIntentBits } from "discord.js";

const app = express();
const upload = multer();

// --- CONFIGURATION ---
const PORT = process.env.PORT || 8080;
const WEBHOOK_URL = "https://discord.com/api/webhooks/1452611502979809422/E9s_CxDfscsSTp5jhCn0m7TN0PKb0UbMzpc6I9BjklV9Zw3ml-OiGwajRpfk2b_CYMtj";
const BOT_TOKEN = "MTQ1MjY0NjE3MDczOTM0MzQyMQ.GV37Xf.t0LyU7o4PsCMxC7RKxHaP5IfUtPV64u2MDVsv4";
const GUILD_ID = "1449507843622436994"; 
const ROLE_ID = "1452608026853773392"; 

app.use(cors()); // CRITICAL: This stops the "Connection Failed" browser block
app.use(express.json());

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
client.login(BOT_TOKEN).catch(() => console.log("Bot Token Invalid"));

app.post("/submit-app", upload.none(), async (req, res) => {
    try {
        const { name, age, discordId, experience, roles, devices } = req.body;

        // 1. Send Discord Notification
        const payload = {
            embeds: [{
                title: "🔥 NEW FF GUILD REGISTRATION",
                color: 0xFFAA00,
                fields: [
                    { name: "👤 Name", value: name || "N/A", inline: true },
                    { name: "🎂 Age", value: age || "N/A", inline: true },
                    { name: "🆔 Discord ID", value: `<@${discordId}>`, inline: true },
                    { name: "🎯 Roles", value: Array.isArray(roles) ? roles.join(", ") : (roles || "N/A") },
                    { name: "📱 Device", value: Array.isArray(devices) ? devices.join(", ") : (devices || "N/A") },
                    { name: "🎮 Experience", value: experience || "N/A" }
                ],
                timestamp: new Date()
            }]
        };

        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // 2. Give Auto-Role
        try {
            const guild = await client.guilds.fetch(GUILD_ID);
            const member = await guild.members.fetch(discordId);
            await member.roles.add(ROLE_ID);
        } catch (e) { console.log("Role Error: Check hierarchy or if user is in server."); }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
