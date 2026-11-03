// Resolves the WhatsApp channel (newsletter) JID from the invite link once,
// so no hard-coded JID of another channel is ever used.
const config = require('../config');

let pending = null;

async function resolveChannelJid(conn) {
    if (config.CHANNEL_JID) return config.CHANNEL_JID;
    if (!pending) {
        pending = (async () => {
            try {
                const meta = await conn.newsletterMetadata('invite', config.CHANNEL_INVITE);
                if (meta && meta.id) config.CHANNEL_JID = meta.id;
            } catch (e) {
                console.error('Channel JID resolve failed:', e.message);
            }
            pending = null;
            return config.CHANNEL_JID;
        })();
    }
    return pending;
}

// Returns a forwardedNewsletterMessageInfo object, or undefined if JID is unknown
async function channelInfo(conn, serverMessageId = 143) {
    const jid = await resolveChannelJid(conn);
    if (!jid) return undefined;
    return { newsletterJid: jid, newsletterName: config.CHANNEL_NAME, serverMessageId };
}

module.exports = { resolveChannelJid, channelInfo };
