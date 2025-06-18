const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') {
      console.log('✅ Bot is connected!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || '';
    const jid = msg.key.remoteJid;

    if (text.toLowerCase() === 'hi') {
      await sock.sendMessage(jid, { text: 'Hello! 🤖 Type "help" for commands.' });
    }

    if (text.toLowerCase() === 'help') {
      await sock.sendMessage(jid, {
        text: `📋 *Available Commands:*\n- hi\n- help\n- time`
      });
    }

    if (text.toLowerCase() === 'time') {
      await sock.sendMessage(jid, { text: `🕐 ${new Date().toLocaleTimeString()}` });
    }
  });
}

startBot();
