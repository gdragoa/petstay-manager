const ADAPTER = process.env.STORAGE_ADAPTER || 'local';
const VALID = ['local', 'vercel'];

if (!VALID.includes(ADAPTER)) {
  throw new Error(`Unknown STORAGE_ADAPTER "${ADAPTER}". Valid values: ${VALID.join(', ')}`);
}

const db = require(`../adapters/${ADAPTER}/db`);
const files = require(`../adapters/${ADAPTER}/files`);

module.exports = { db, files, adapter: ADAPTER };
