import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "../utils/swal";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ActionMenu from "../components/ActionMenu";

type Client = {
  id: number;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  status: "Actif" | "Inactif" | "Prospect";
  lastActivity: string;
  assigned_to_user_id?: number;
  assignedUserName?: string | null;
};

const Clients = () => {
  const [data, setData] = useState<Client[]>([]);
  const navigate = useNavigate();
  const { isAdmin, user, token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchClients = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get("http://localhost:3001/api/clients", config);

        const formatted = response.data.map((client: any) => ({
          id: client.id,
          name: client.name,
          company: client.company,
          email: client.email,
          phone: client.phone,
          status: client.status,
          lastActivity: new Date(client.created_at).toLocaleDateString("fr-FR"),
          assigned_to_user_id: client.assigned_to_user_id,
          assignedUserName: client.assignedUserName,
        }));
        setData(formatted);
      } catch (error) {
        console.error("Erreur lors du chargement des clients :", error);
      }
    };
    fetchClients();
  }, [token]);

  const handleDelete = (client: Client) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      html: `Vous ne pourrez pas revenir en arrière après avoir supprimé <strong>${client.name}</strong> !`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:3001/api/clients/${client.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(() => {
            setData((prev) => prev.filter((c) => c.id !== client.id));
            Swal.fire("Supprimé !", "Le client a été supprimé.", "success");
          })
          .catch((error) => {
            const message = error.response?.data?.message || "Impossible de supprimer le client.";
            Swal.fire("Erreur", message, "error");
          });
      }
    });
  };

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      { accessorKey: "name", header: "Nom du Client", cell: ({ row }) => {
          const client = row.original;
          return (<Link to={`/clients/${client.id}`} className="flex items-center gap-3 group"><img src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} alt="avatar" className="w-8 h-8 rounded-full" /><span className="font-medium group-hover:text-primary group-hover:underline">{client.name}</span></Link>);
      }},
      { accessorKey: "company", header: "Entreprise" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "status", header: "Statut", cell: (info) => {
          const status = info.getValue() as Client["status"];
          const statusColor = { Actif: "bg-green-500", Inactif: "bg-red-500", Prospect: "bg-yellow-500" };
          return (<span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${statusColor[status]}`}></span>{status}</span>);
      }},
      { accessorKey: "assignedUserName", header: "Responsable", cell: info => info.getValue() || <span className="text-text-secondary italic">Non assigné</span> },
      { accessorKey: "lastActivity", header: "Créé le" },
      { id: "actions", header: () => <div className="text-right">Actions</div>, cell: ({ row }) => {
          const client = row.original;
          const canEdit = isAdmin || client.assigned_to_user_id === user?.id;
          const canDelete = isAdmin;
          return (<div className="flex justify-end"><ActionMenu onEdit={canEdit ? () => navigate(`/clients/modifier/${client.id}`) : undefined} onDelete={canDelete ? () => handleDelete(client) : undefined} /></div>);
      }},
    ],
    [navigate, isAdmin, user?.id]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Clients</h1>
          {isAdmin && (
            <Link to="/clients/nouveau" className="flex items-center gap-2 bg-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg">
              <PlusCircle size={20} />
              Ajouter un client
            </Link>
          )}
        </div>
        <div className="bg-card rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-card/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>{headerGroup.headers.map((header) => (<th key={header.id} className="px-6 py-3 text-sm font-semibold text-text-secondary uppercase tracking-wider">{flexRender(header.column.columnDef.header, header.getContext())}</th>))}</tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border hover:bg-bg">{row.getVisibleCells().map((cell) => (<td key={cell.id} className="px-6 py-4 whitespace-nowrap text-text-primary">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>))}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 text-text-secondary">
          <div>Page <strong>{table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}</strong></div>
          <div className="flex items-center gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-card"><ChevronLeft size={20} /></button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-card"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Clients;