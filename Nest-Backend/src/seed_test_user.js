const { Client } = require('pg');
const crypto = require('crypto');

const JWT_SECRET = 'sport_jwt_secret_key_change_in_production_2026';

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signJwt(payload, secret = JWT_SECRET) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function getRealTokens() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'sport_ecommerce'
  });

  await client.connect();

  const userRes = await client.query("SELECT id, email FROM users WHERE is_active = true LIMIT 1");
  const adminRes = await client.query("SELECT id, email FROM admin_users WHERE is_active = true LIMIT 1");

  let user = userRes.rows[0];
  let admin = adminRes.rows[0];

  console.log("Found User ID:", user?.id, "Email:", user?.email);
  console.log("Found Admin ID:", admin?.id, "Email:", admin?.email);

  if (user) {
    const custToken = signJwt({ sub: user.id, email: user.email, role: 'CUSTOMER' });
    console.log("CUST_TOKEN=" + custToken);
    process.stdout.write("USER_ID=" + user.id + "\n");
  }

  if (admin) {
    const adminToken = signJwt({ sub: admin.id, email: admin.email, role: 'SUPER_ADMIN', permissions: ['SUPPORT_VIEW', 'SUPPORT_REPLY', 'SUPPORT_ASSIGN', 'SUPPORT_RESOLVE', 'SUPPORT_NOTE'] });
    console.log("ADMIN_TOKEN=" + adminToken);
    process.stdout.write("ADMIN_ID=" + admin.id + "\n");
  }

  await client.end();
}

getRealTokens().catch(console.error);
