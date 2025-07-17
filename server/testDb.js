const pool = require('./config/db');

async function testConnection() {
  console.log("Tentative de connexion...");
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Connexion réussie !");
    
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    console.log("✅ Requête réussie. Résultat :", rows[0].solution);
    
  } catch (error) {
    console.error("❌ ERREUR DE CONNEXION OU DE REQUÊTE :", error);
  } finally {
    if (connection) connection.release();
    await pool.end();
    console.log("Connexion au pool terminée.");
  }
}

testConnection();