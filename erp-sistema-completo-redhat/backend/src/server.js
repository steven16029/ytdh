const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'erp-postgres-svc',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'erpdb',
  user: process.env.DB_USER || 'erpadmin',
  password: process.env.DB_PASSWORD || 'ErpRedHat2026!'
});

// Middleware opcional para validar token Bearer de Red Hat SSO (Keycloak)
const validateRhSso = (req, res, next) => {
  if (process.env.ENFORCE_RHSSO === 'true') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token Bearer de Red Hat SSO requerido' });
    }
  }
  next();
};

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'UP', database: 'CONNECTED', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'DEGRADED', database: err.message });
  }
});

app.get('/api/v1/metrics', validateRhSso, async (req, res) => {
  const region = (req.headers['x-erp-region'] || req.query.region || 'LATAM').toUpperCase();
  try {
    const result = await pool.query(
      'SELECT region_code, currency, revenue, orders_count, tax_label, updated_at FROM regional_metrics WHERE region_code = $1',
      [region]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Región ${region} no encontrada` });
    }

    const row = result.rows[0];
    res.json({
      region: row.region_code,
      currency: row.currency,
      revenue: Number(row.revenue).toLocaleString('en-US'),
      orders: row.orders_count,
      taxRate: row.tax_label,
      updatedAt: row.updated_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Error consultando PostgreSQL', details: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ERP Backend API escuchando en puerto ${PORT}`);
});
