const { Client } = require('pg');
const bcrypt = require('bcryptjs');
(async () => {
  const client = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'vemtap_clinic' });
  await client.connect();
  const res = await client.query('SELECT id, email, password, "isActive" FROM users WHERE email = $1', ['Jaycreatedit@gmail.com']);
  console.log('rows', res.rows.length);
  if (res.rows[0]) {
    const row = res.rows[0];
    console.log('active', row.isActive);
    console.log('hashPrefix', row.password && row.password.slice(0, 20));
    console.log('matches', await bcrypt.compare('moonshop', row.password));
    console.log('matchesWrong', await bcrypt.compare('moonshop1', row.password));
  }
  await client.end();
})();
