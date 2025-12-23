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
const BOT_TOKEN = "MTQ1MjY0NDM2Njc1NjYxMDExMA.GhBHvx.W7l-d4uVFmyYySDiWu1z49OLJ_z7BWlO3SugiI"; // Your New Token
const GUILD_ID = "1449507843622436994"; 
const ROLE_ID = "1452608026853773392"; 

app.use(cors());
app.use(express.json());

// Initialize Discord Bot
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] 
});

client.on("ready", () => {
    console.log(`✅ Bot is ONLINE: ${client.user.tag}`);
});

client.login(BOT_TOKEN).catch((err) => {
    console.error("❌ BOT LOGIN FAILED: Check your token permissions.");
});

app.post("/submit-app", upload.none(), async (req, res) => {
    const { name, age, discordId, experience, roles, devices } = req.body;

    try {
        // 1. Send Discord Webhook Notification
        const payload = {
            embeds: [{
                title: "🔥 NEW GUILD REGISTRATION",
                color: 0xff4444,
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

        // 2. Auto-Role Logic
        try {
            const guild = await client.guilds.fetch(GUILD_ID);
            const member = await guild.members.fetch(discordId);
            if (member) {
                await member.roles.add(ROLE_ID);
                console.log(`✅ Role added to ${name}`);
            }
        } catch (roleErr) {
            console.log("⚠️ Role could not be added. (User not in server or Bot role too low)");
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Submission error:", err);
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
