const { Client } = require('pg');

async function checkSchema() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'sport_ecommerce'
  });

  await client.connect();

  const res = await client.query(`
    SELECT column_name, is_nullable, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'reviews';
  `);

  console.log("Reviews Table Columns Schema:");
  console.table(res.rows);

  await client.end();
}

checkSchema().catch(console.error);
