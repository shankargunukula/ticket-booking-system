const ldap = require('ldapjs');
require('dotenv').config();

const client = ldap.createClient({
  url: process.env.LDAP_URL || 'ldaps://your-ldap-server.com:636',
  // Optional for self-signed certificates in dev environments:
  // tlsOptions: { rejectUnauthorized: false }
});

client.on('error', (err) => {
  console.error('LDAP Client Critical Error:', err.message);
});

module.exports = client;
