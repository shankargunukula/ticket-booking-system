// backend/controllers/authController.js
const client = require('../config/ldap');
require('dotenv').config();

exports.registerUser = (req, res) => {
  const { username, firstName, lastName, mobile, password } = req.body;

  const adminDN = process.env.LDAP_ADMIN_DN;
  const adminPassword = process.env.LDAP_ADMIN_PASSWORD;

  console.log("📥 [Node.js] Received registration request for user:", username);
  console.log("🔌 Attempting to connect & bind to LDAP server...");

  // Execute LDAP bind manager authentication
  client.bind(adminDN, adminPassword, (bindErr) => {
    if (bindErr) {
      console.error('❌ LDAP Management Bind Failure:', bindErr.message);
      return res.status(500).json({
        error: 'Internal connection issue with directory server.',
        details: bindErr.message
      });
    }

    console.log("✅ LDAP Admin Bind Successful. Ensuring Parent OU exists...");

    // 🚀 STEP 1: Define the parent Organizational Unit ("ou=users")
    const parentOU_DN = 'ou=users,dc=booking,dc=com';
    const ouEntry = {
      objectClass: ['top', 'organizationalUnit'],
      ou: 'users'
    };

    // 🚀 STEP 2: Safe-add the OU folder. If it already exists, ignore the error and move forward.
    client.add(parentOU_DN, ouEntry, (ouErr) => {
      if (ouErr && ouErr.name !== 'EntryAlreadyExistsError') {
        console.error('❌ Failed to provision parent organizational group:', ouErr.message);
        return res.status(500).json({ error: 'Failed to structure directory framework dependencies.' });
      }

      console.log("📁 Directory folder 'ou=users' verified. Provisioning user node...");

      // STEP 3: Proceed with creating the actual user account record node
      const newUserDN = `uid=${username},ou=users,dc=booking,dc=com`;
      const entry = {
        objectClass: ['top', 'person', 'organizationalPerson', 'inetOrgPerson'],
        uid: username,
        cn: `${firstName} ${lastName}`,
        sn: lastName,
        givenName: firstName,
        mobile: mobile,
        userPassword: password
      };

      // Save the new record node into the LDAP directory tree
      client.add(newUserDN, entry, (addErr) => {
        if (addErr) {
          console.error('❌ LDAP Node Insertion Failure:', addErr.message);
          if (addErr.name === 'EntryAlreadyExistsError') {
            return res.status(400).json({ error: 'This username is already taken.' });
          }
          return res.status(500).json({
            error: 'Directory server failed to save user account.',
            details: addErr.message
          });
        }

        console.log("🎉 User account provisioned successfully in LDAP!");
        return res.status(201).json({ message: 'User provisioned successfully.' });
      });
    });
  });
};
