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

function App() {
  const isAuthenticated = true;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {isAuthenticated ? (
        <>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          
          <Route path="/clients/nouveau" element={<AddClientPage />} />
          <Route path="/clients/modifier/:clientId" element={<EditClientPage />} />
          <Route path="/clients/:clientId" element={<ClientDetailPage />} />
          
          <Route path="/chat" element={<Chat />} />
          <Route path="/rappels" element={<Rappels />} />
          <Route path="/parametres" element={<Parametres />} />
          <Route path="/pipeline" element={<PipelinePage />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (

        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default App;