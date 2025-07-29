const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth"); 

router.get("/", auth, async (req, res) => {
  try {
    const [
      revenueResult,
      salesResult,
      clientsResult,
      opportunitiesResult,
      wonDealsResult,
    ] = await Promise.all([
      db.query("SELECT SUM(amount) as totalRevenue FROM transactions"),
      db.query("SELECT COUNT(*) as totalSales FROM transactions"),
      db.query("SELECT COUNT(*) as activeClients FROM clients WHERE status = 'Actif'"),
      db.query("SELECT status FROM opportunities WHERE status IN ('Gagné', 'Perdu')"),
      db.query(`
        SELECT 
          SUM(CASE WHEN status = 'Gagné' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) THEN value ELSE 0 END) as currentMonthRevenue,
          COUNT(CASE WHEN status = 'Gagné' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) THEN 1 END) as currentMonthDeals,
          SUM(CASE WHEN status = 'Gagné' AND MONTH(created_at) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(created_at) = YEAR(CURDATE() - INTERVAL 1 MONTH) THEN value ELSE 0 END) as previousMonthRevenue
        FROM opportunities
      `),
    ]);

    const totalRevenue = revenueResult[0][0].totalRevenue || 0;
    const totalSales = salesResult[0][0].totalSales || 0;
    const activeClients = clientsResult[0][0].activeClients || 0;

    const wonOpps = opportunitiesResult[0].filter(opp => opp.status === 'Gagné').length;
    const lostOpps = opportunitiesResult[0].filter(opp => opp.status === 'Perdu').length;
    const totalClosedOpps = wonOpps + lostOpps;

    const conversionRate = totalClosedOpps > 0 
      ? ((wonOpps / totalClosedOpps) * 100).toFixed(1) + '%' 
      : '0%';

    const wonDealsStats = wonDealsResult[0][0];
    const currentMonthRevenue = wonDealsStats.currentMonthRevenue || 0;
    const currentMonthDeals = wonDealsStats.currentMonthDeals || 0;
    const previousMonthRevenue = wonDealsStats.previousMonthRevenue || 0;

    let revenueGrowth = 0;
    if (previousMonthRevenue > 0) {
      revenueGrowth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    } else if (currentMonthRevenue > 0) {
      revenueGrowth = 100;
    }

    const stats = {
      revenue: totalRevenue,
      sales: totalSales,
      clients: activeClients,
      conversionRate: conversionRate,
      wonDeals: {
        revenue: currentMonthRevenue,
        count: currentMonthDeals,
        growth: revenueGrowth.toFixed(1),
      },
    };

    res.json(stats);
  } catch (err) {
    console.error("Erreur [GET /api/dashboard-stats]:", err);
    res.status(500).send("Erreur serveur");
  }
});


router.get("/sales-overview", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(sale_date, '%Y-%m') AS month,
        SUM(total_price) AS total
      FROM sales
      WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur [GET /sales-overview]:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


router.get("/recent-activity", auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.content, i.date, u.name as userName
      FROM interactions i
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.date DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur [GET /recent-activity]:", err);
    res.status(500).send("Erreur serveur");
  }
});


router.get("/client-status-distribution", auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM clients 
      GROUP BY status
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur [GET /client-status-distribution]:", err);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;
