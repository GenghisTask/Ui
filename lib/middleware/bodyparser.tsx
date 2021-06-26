// eslint-disable-next-line @typescript-eslint/no-var-requires
const bodyParser = require('body-parser');
/**
 * Middleware to support Reactivesearch x-ndjson request
 */
const handler = bodyParser.text({ type: 'application/x-ndjson' });
export default handler;
