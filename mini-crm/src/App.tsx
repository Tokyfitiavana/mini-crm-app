import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import AddClientPage from "./pages/AddClient";
import EditClientPage from "./pages/EditClientPage";
import Chat from "./pages/Chat";
import Rappels from "./pages/Rappel";
import Parametres from "./pages/Parametres";
import ClientDetailPage from "./pages/ClientDetailPage";
import PipelinePage from "./pages/PipeLinePage";
import StockManager from "./pages/StockManager";
import SalesManager from "./pages/SalesManager";

import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import NotificationsPage from "./pages/Notifications";



function App() {
  const isAuthenticated = !!localStorage.getItem("authToken");

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <PrivateRoute>
            <Clients />
          </PrivateRoute>
        }
      />
      <Route
        path="/clients/nouveau"
        element={
          <PrivateRoute>
            <AddClientPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/clients/modifier/:clientId"
        element={
          <PrivateRoute>
            <EditClientPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/clients/:clientId"
        element={
          <PrivateRoute>
            <ClientDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        }
      />
      <Route
        path="/rappels"
        element={
          <PrivateRoute>
            <Rappels />
          </PrivateRoute>
        }
      />
      <Route
        path="/parametres"
        element={
          <PrivateRoute>
            <Parametres />
          </PrivateRoute>
        }
      />
      <Route
        path="/pipeline"
        element={
          <PrivateRoute>
            <PipelinePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/stock"
        element={
          <PrivateRoute>
            <StockManager />
          </PrivateRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <PrivateRoute>
            <SalesManager />
          </PrivateRoute>
        }
      />

      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/notifications" element={<NotificationsPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
