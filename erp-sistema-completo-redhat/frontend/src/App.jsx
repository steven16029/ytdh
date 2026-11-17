import React, { useEffect, useState } from 'react';
import axios from 'axios';
import keycloak from './services/redhatAuth';

const REGIONS = {
  LATAM: { currency: 'COP', lang: 'es-CO', label: 'Latinoamérica (Bogotá)' },
  NA: { currency: 'USD', lang: 'en-US', label: 'Norteamérica (New York)' },
  EU: { currency: 'EUR', lang: 'de-DE', label: 'Europa (Frankfurt)' }
};

export default function App() {
  const authEnabled = window._env_?.REACT_APP_AUTH_ENABLED === 'true';
  const [authenticated, setAuthenticated] = useState(!authEnabled);
  const [region, setRegion] = useState('LATAM');
  const [financialData, setFinancialData] = useState(null);
  const [statusMsg, setStatusMsg] = useState('Conectando con API...');

  useEffect(() => {
    if (authEnabled) {
      keycloak
        .init({ onLoad: 'login-required', checkLoginIframe: false })
        .then((auth) => {
          setAuthenticated(auth);
          if (auth) fetchErpMetrics(region);
        })
        .catch(() => setStatusMsg('Error conectando con Red Hat SSO'));
    } else {
      fetchErpMetrics(region);
    }
  }, []);

  const fetchErpMetrics = async (selectedRegion) => {
    try {
      const apiBaseUrl =
        window._env_?.REACT_APP_3SCALE_API_URL ||
        'https://erp-backend-route-steven-1602-dev.apps.rm2.thpm.p1.openshiftapps.com/api/v1';

      const headers = {
        'X-ERP-Region': selectedRegion,
        'X-ERP-Currency': REGIONS[selectedRegion].currency
      };

      if (authEnabled && keycloak.token) {
        headers.Authorization = `Bearer ${keycloak.token}`;
      }

      const response = await axios.get(`${apiBaseUrl}/metrics`, { headers });
      setFinancialData(response.data);
      setStatusMsg('Conectado / PostgreSQL + OpenShift Activo');
    } catch (err) {
      setStatusMsg('Modo Offline / Revisa la URL del Backend en ConfigMap');
      setFinancialData({
        revenue: selectedRegion === 'LATAM' ? '5,850,000,000' : selectedRegion === 'NA' ? '1,450,000' : '1,320,000',
        orders: selectedRegion === 'LATAM' ? 412 : selectedRegion === 'NA' ? 342 : 289,
        taxRate: selectedRegion === 'LATAM' ? '19% IVA' : selectedRegion === 'NA' ? '8.875% Sales Tax' : '19% MwSt'
      });
    }
  };

  const handleRegionChange = (e) => {
    const newRegion = e.target.value;
    setRegion(newRegion);
    fetchErpMetrics(newRegion);
  };

  if (!authenticated) {
    return <div style={{ padding: 20 }}>Autenticando en Red Hat Single Sign-On...</div>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ee0000', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#151515' }}>Global ERP Enterprise</h1>
          <small style={{ color: '#6a6e73' }}>Desplegado en Red Hat OpenShift</small>
        </div>
        <div>
          <select value={region} onChange={handleRegionChange} style={{ marginRight: '1rem', padding: '0.5rem', borderRadius: '4px' }}>
            {Object.entries(REGIONS).map(([key, val]) => (
              <option key={key} value={key}>{val.label} - ({val.currency})</option>
            ))}
          </select>
          {authEnabled && (
            <>
              <span>Usuario: <strong>{keycloak.tokenParsed?.preferred_username}</strong></span>
              <button onClick={() => keycloak.logout()} style={{ marginLeft: '1rem', padding: '0.4rem 0.8rem' }}>Cerrar Sesión</button>
            </>
          )}
        </div>
      </header>

      <main style={{ marginTop: '2rem' }}>
        <h2>Resumen Operativo - {REGIONS[region].label}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ border: '1px solid #d2d2d2', padding: '1.25rem', borderRadius: '6px', background: '#fafafa' }}>
            <h3 style={{ marginTop: 0, color: '#4f5255' }}>Ingresos Consolidados</h3>
            <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
              {financialData?.revenue || '---'} {REGIONS[region].currency}
            </p>
            <small>Impuesto regional: {financialData?.taxRate || 'N/A'}</small>
          </div>
          <div style={{ border: '1px solid #d2d2d2', padding: '1.25rem', borderRadius: '6px', background: '#fafafa' }}>
            <h3 style={{ marginTop: 0, color: '#4f5255' }}>Órdenes Internacionales</h3>
            <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
              {financialData?.orders || '---'}
            </p>
            <small>Sincronizado con PostgreSQL</small>
          </div>
          <div style={{ border: '1px solid #d2d2d2', padding: '1.25rem', borderRadius: '6px', background: '#fafafa' }}>
            <h3 style={{ marginTop: 0, color: '#4f5255' }}>Estado Red Hat Gateway</h3>
            <p style={{ color: '#3e8635', fontWeight: 'bold', margin: '0.5rem 0' }}>{statusMsg}</p>
            <small>TLS Edge Termination</small>
          </div>
        </div>
      </main>
    </div>
  );
}
