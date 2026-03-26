const { Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const http = require('http');
require('dotenv').config();

// 1. RENDER HEALTH CHECK
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Moderator Bot is Active');
}).listen(process.env.PORT || 10000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const PREFIX = "!";
// Add words you want to block here
const BANNED_WORDS = ["scam", "free-nitro", "fake-link"]; 

client.once('ready', () => {
    console.log(`✅ Shield Bot Online: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // --- AUTO-MOD LOGIC (No prefix needed) ---
    
    // 1. Block Banned Words
    const foundWord = BANNED_WORDS.some(word => message.content.toLowerCase().includes(word));
    if (foundWord) {
        await message.delete().catch(err => console.log("Missing delete perms"));
        return message.channel.send(`⚠️ ${message.author}, that word is not allowed here!`).then(m => setTimeout(() => m.delete(), 3000));
    }

    // 2. Block Discord Invites (Prevents advertising)
    if (message.content.includes("discord.gg/") || message.content.includes("discord.com/invite/")) {
        // Allow Admins to post links, but block everyone else
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            await message.delete().catch(err => console.log("Missing delete perms"));
            return message.reply("🚫 No advertising other servers!");
        }
    }

    // --- MODERATOR COMMANDS (!clear, !kick, !ban) ---
    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'clear') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("Pick 1-100.");
        await message.channel.bulkDelete(amount, true);
        message.channel.send(`🧹 Cleared ${amount} messages.`).then(m => setTimeout(() => m.delete(), 2000));
    }

    // Add Kick/Ban logic here as well...
});

client.login(process.env.TOKEN);
