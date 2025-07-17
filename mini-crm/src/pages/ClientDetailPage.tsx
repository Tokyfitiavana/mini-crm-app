import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { ChevronLeft, Edit, Mail, Phone, Building, MessageSquare, DollarSign, Tag, Plus } from 'lucide-react';
import Swal from '../utils/swal';

// Types pour les données
type Client = { id: number; name: string; company?: string; email: string; phone?: string; status: string; tags?: string[]; };
type Interaction = { id: number; type: string; content: string; date: string; userName: string; };
type Transaction = { id: number; description: string; amount: number; date: string; };

const ClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("Non authentifié");

        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        const [clientRes, interactionsRes, transactionsRes] = await Promise.all([
          axios.get(`http://localhost:3001/api/clients/${clientId}`, config),
          axios.get(`http://localhost:3001/api/interactions/client/${clientId}`, config),
          axios.get(`http://localhost:3001/api/transactions/client/${clientId}`, config)
        ]);
        
        setClient(clientRes.data);
        setInteractions(interactionsRes.data);
        setTransactions(transactionsRes.data);

      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Impossible de charger les données du client.';
        Swal.fire('Erreur', message, 'error');
        setClient(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    if (newNote.trim() === '') return;
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.post('http://localhost:3001/api/interactions', {
        clientId: client?.id,
        content: newNote,
      }, config);
      setInteractions(prev => [response.data, ...prev]);
      setNewNote('');
    } catch (error) {
      Swal.fire('Erreur', "La note n'a pas pu être ajoutée.", 'error');
    }
  };

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (loading) return <DashboardLayout><div className="text-center p-10 text-text-secondary">Chargement...</div></DashboardLayout>;
  if (!client) return <DashboardLayout><div className="text-center p-10 text-text-secondary">Client non trouvé. <Link to="/clients" className="text-primary underline">Retourner à la liste</Link></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button onClick={() => navigate('/clients')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"><ChevronLeft size={20} />Retour à la liste des clients</button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} alt="avatar" className="w-16 h-16 rounded-full"/>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">{client.name}</h1>
                <p className="text-text-secondary">{client.company}</p>
              </div>
            </div>
            <Link to={`/clients/modifier/${client.id}`} className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90"><Edit size={18} />Modifier</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-3 mb-4">Informations de contact</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3"><Mail size={16} className="text-text-secondary"/> <a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email}</a></li>
                <li className="flex items-center gap-3"><Phone size={16} className="text-text-secondary"/> <span>{client.phone || "Non renseigné"}</span></li>
                <li className="flex items-center gap-3"><Building size={16} className="text-text-secondary"/> <span>{client.company || "Non renseigné"}</span></li>
              </ul>
            </div>
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-3 mb-4">Statistiques Clés</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-text-secondary">Dépenses totales</span><span className="font-bold text-text-primary">{totalSpent.toLocaleString("fr-FR")} €</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Nombre de commandes</span><span className="font-bold text-text-primary">{transactions.length}</span></div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-3 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {client.tags?.map(tag => <span key={tag} className="bg-bg text-text-secondary text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>)}
                <button className="text-text-secondary hover:text-primary"><Plus size={16} /></button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Historique des interactions</h3>
              <form onSubmit={handleAddNote} className="mb-6"><textarea placeholder="Ajouter une nouvelle note..." className="w-full bg-bg border border-border rounded-md p-2 text-sm text-text-primary" rows={2} value={newNote} onChange={(e) => setNewNote(e.target.value)}></textarea><button type="submit" className="bg-primary text-white py-1.5 px-4 rounded-md text-sm mt-2 float-right hover:opacity-90">Ajouter la note</button></form>
              <ul className="space-y-4 pt-4 clear-both">
                {interactions.length > 0 ? (interactions.map(item => (<li key={item.id} className="flex gap-3"><div className="bg-bg p-3 rounded-full h-fit"><MessageSquare size={16} className="text-text-secondary"/></div><div><p className="text-sm text-text-primary">{item.content}</p><p className="text-xs text-text-secondary mt-1">Par {item.userName || 'Utilisateur inconnu'} - {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p></div></li>))) : (<p className="text-sm text-text-secondary text-center py-4">Aucune interaction enregistrée.</p>)}
              </ul>
            </div>
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Historique des Transactions</h3>
              <ul className="space-y-4">
                {transactions.length > 0 ? (transactions.map(item => (<li key={item.id} className="flex items-center justify-between"><div className="flex gap-3"><div className="bg-bg p-3 rounded-full h-fit"><DollarSign size={16} className="text-green-500"/></div><div><p className="font-semibold text-text-primary">{item.description}</p><p className="text-xs text-text-secondary mt-1">{new Date(item.date).toLocaleDateString('fr-FR')}</p></div></div><span className="font-bold text-text-primary">{item.amount.toLocaleString('fr-FR')} €</span></li>))) : (<p className="text-sm text-text-secondary text-center py-4">Aucune transaction enregistrée.</p>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetailPage;