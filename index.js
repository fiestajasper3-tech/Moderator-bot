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

const PREFIX = "!"; // You can change this to . or ?

client.once('ready', () => {
    console.log(`✅ Moderator Bot Online: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- COMMAND: !CLEAR [NUMBER] ---
    if (command === 'clear' || command === 'purge') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) 
            return message.reply("❌ You don't have permission to clear messages!");

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) 
            return message.reply("Please provide a number between 1 and 100.");

        await message.channel.bulkDelete(amount, true);
        message.channel.send(`🧹 Deleted ${amount} messages.`).then(m => setTimeout(() => m.delete(), 3000));
    }

    // --- COMMAND: !KICK [@USER] ---
    if (command === 'kick') {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) 
            return message.reply("❌ You can't kick people!");

        const target = message.mentions.members.first();
        if (!target) return message.reply("Tag a user to kick.");
        
        try {
            await target.kick();
            message.reply(`✈️ ${target.user.tag} has been kicked.`);
        } catch (err) {
            message.reply("⚠️ I couldn't kick that user. They might have higher rank than me.");
        }
    }

    // --- COMMAND: !BAN [@USER] ---
    if (command === 'ban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) 
            return message.reply("❌ You can't ban people!");

        const target = message.mentions.members.first();
        if (!target) return message.reply("Tag a user to ban.");
        
        try {
            await target.ban();
            message.reply(`🔨 ${target.user.tag} has been banned.`);
        } catch (err) {
            message.reply("⚠️ Error banning user.");
        }
    }
});

client.login(process.env.TOKEN);
