const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'sport_ecommerce'
  });

  await client.connect();

  const msgs = await client.query("SELECT * FROM ticket_messages WHERE ticket_id = 'f1f38c71-295d-438b-baf9-602112a7fc9e' ORDER BY created_at ASC");
  console.log("Ticket Messages in DB:", msgs.rows);

  await client.end();
}

run().catch(console.error);
