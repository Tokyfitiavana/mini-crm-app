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
import PageLoader from "./components/PageLoader";

function App() {
  const isAuthenticated = true;

  return (
    <>
      <PageLoader />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/clients"
          element={isAuthenticated ? <Clients /> : <Navigate to="/login" />}
        />
        <Route
          path="/clients/nouveau"
          element={isAuthenticated ? <AddClientPage /> : <Navigate to="/login" />}
        />
        <Route path="/clients/modifier/:clientId" element={<EditClientPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/rappels" element={<Rappels />} />
        <Route path="/parametres" element={<Parametres />} />
        <Route path="/clients/:clientId" element={<ClientDetailPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
      </Routes>
    </>
  );
}


export default App;
