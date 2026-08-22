const client = require('../config/ldap');
require('dotenv').config();

exports.registerUser = (req, res) => {
  // Extract parsed data from our validation middleware layer
  const { username, firstName, lastName, mobile, password } = req.body;

  const adminDN = process.env.LDAP_ADMIN_DN;
  const adminPassword = process.env.LDAP_ADMIN_PASSWORD;

  // 1. Authenticate backend with LDAP Directory as Manager/Admin
  client.bind(adminDN, adminPassword, (bindErr) => {
    if (bindErr) {
      console.error('LDAP Management Bind Failure:', bindErr);
      return res.status(500).json({ error: 'Internal connection issue with directory server.' });
    }

    // 2. Define the path (Distinguished Name) where this record lives
    const newUserDN = `uid=${username},ou=users,dc=booking,dc=com`;

    // 3. Construct the LDAP Entry payload mapped to inetOrgPerson schemas
    const entry = {
      objectClass: ['top', 'person', 'organizationalPerson', 'inetOrgPerson'],
      uid: username,
      cn: `${firstName} ${lastName}`,
      sn: lastName,
      givenName: firstName,
      mobile: mobile,
      userPassword: password // LDAP auto-hashes this dynamically based on server configurations
    };

    // 4. Save the entity node into the LDAP directory tree
    client.add(newUserDN, entry, (addErr) => {
      if (addErr) {
        if (addErr.name === 'EntryAlreadyExistsError') {
          return res.status(400).json({ error: 'This username is already taken.' });
        }
        console.error('LDAP Node Insertion Failure:', addErr);
        return res.status(500).json({ error: 'Directory server failed to save user account.' });
      }

      // 5. Respond back successfully to React
      return res.status(201).json({ message: 'User provisioned successfully.' });
    });
  });
};
