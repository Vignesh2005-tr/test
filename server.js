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
const GUILD_ID = "1449507843622436994"; // Your Guild ID
const ROLE_ID = "1452608026853773392";  // Role to give automatically

app.use(cors());
app.use(express.json());

// Discord Bot for Auto-Role
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
client.login(BOT_TOKEN).catch(() => console.log("Bot Token Invalid"));

app.post("/submit-app", upload.none(), async (req, res) => {
    const { name, age, discordId, experience, roles, devices } = req.body;

    try {
        // 1. Send Discord Webhook Notification
        const embed = {
            title: "🔥 NEW GUILD REGISTRATION",
            color: 0xFFAA00,
            fields: [
                { name: "👤 Name", value: name, inline: true },
                { name: "🎂 Age", value: age, inline: true },
                { name: "🆔 Discord ID", value: `<@${discordId}>`, inline: true },
                { name: "🎮 Experience", value: experience },
                { name: "🎯 Roles", value: Array.isArray(roles) ? roles.join(", ") : roles },
                { name: "📱 Device", value: Array.isArray(devices) ? devices.join(", ") : devices }
            ],
            timestamp: new Date()
        };

        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embed] })
        });

        // 2. Auto-Role Logic
        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(discordId).catch(() => null);
        if (member) {
            await member.roles.add(ROLE_ID);
            console.log(`Role added to ${discordId}`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => console.log(`Server live on ${PORT}`));