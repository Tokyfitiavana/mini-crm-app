const pool = require("../config/db");

const User = {
  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },

  async create({ name, avatar }) {
    const [result] = await pool.query(
      "INSERT INTO users (name, avatar) VALUES (?, ?)",
      [name, avatar]
    );
    return { id: result.insertId, name, avatar };
  },

  async getAll() {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
  },
};

module.exports = User;
