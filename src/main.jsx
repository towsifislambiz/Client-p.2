import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Admin pages
import { AdminAuthProvider } from './admin/AdminAuthContext.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import AdminLoginPage from './admin/AdminLoginPage.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import AdminProducts from './admin/AdminProducts.jsx'
import AdminOrders from './admin/AdminOrders.jsx'
import AdminHero from './admin/AdminHero.jsx'
import AdminSettings from './admin/AdminSettings.jsx'
import AdminSecurity from './admin/AdminSecurity.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ─── Storefront ─── */}
          <Route path="/" element={<App />} />

          {/* ─── Admin: Login ─── */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ─── Admin: Protected Dashboard ─── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="hero" element={<AdminHero />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="security" element={<AdminSecurity />} />
          </Route>

          {/* ─── Catch-all ─── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  </StrictMode>,
)
