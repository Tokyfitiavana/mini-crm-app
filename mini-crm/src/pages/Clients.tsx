// Code complet de Clients.tsx avec tri dynamique, filtrage, gestion stricte de TypeScript, et message "aucun client trouvé"

import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash,
  ArrowDownAZ,
  ArrowUpAZ,
} from "lucide-react";
import Swal from "../utils/swal";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

type Client = {
  id: number;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  status: "Actif" | "Inactif" | "Prospect";
  assigned_to_user_id?: number;
  assignedUserName?: string | null;
};

const Clients = () => {
  const [data, setData] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const navigate = useNavigate();
  const { isAdmin, user, token } = useAuth();

  const fetchClients = async () => {
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        "http://localhost:3001/api/clients",
        config
      );
      const formatted = response.data.map((client: any) => ({
        id: client.id,
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone,
        status: client.status,
        assigned_to_user_id: client.assigned_to_user_id,
        assignedUserName: client.assignedUserName,
      }));
      setData(formatted);
    } catch (error) {
      console.error("Erreur lors du chargement des clients :", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    return data.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

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
        axios
          .delete(`http://localhost:3001/api/clients/${client.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(() => {
            setData((prev) => prev.filter((c) => c.id !== client.id));
            Swal.fire("Supprimé !", "Le client a été supprimé.", "success");
          })
          .catch((error) => {
            const message =
              error.response?.data?.message ||
              "Impossible de supprimer le client.";
            Swal.fire("Erreur", message, "error");
          });
      }
    });
  };

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nom du Client",
        enableSorting: true,
        cell: ({ row }) => {
          const client = row.original;
          return (
            <Link
              to={`/clients/${client.id}`}
              className="flex items-center gap-3 group"
            >
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium group-hover:text-primary group-hover:underline">
                {client.name}
              </span>
            </Link>
          );
        },
      },
      { accessorKey: "company", header: "Entreprise", enableSorting: true },
      { accessorKey: "email", header: "Email", enableSorting: true },
      {
        accessorKey: "phone",
        header: "Téléphone",
        enableSorting: true,
        cell: (info) =>
          info.getValue() ? (
            <a
              href={`tel:${info.getValue()}`}
              className="text-blue-600 underline"
            >
              {info.getValue() as string}
            </a>
          ) : (
            <span className="text-text-secondary italic">Non renseigné</span>
          ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        enableSorting: true,
        cell: (info) => {
          const status = info.getValue() as Client["status"];
          const statusColor = {
            Actif: "bg-green-500",
            Inactif: "bg-red-500",
            Prospect: "bg-yellow-500",
          };
          return (
            <span className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${statusColor[status]}`}
              ></span>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "assignedUserName",
        header: "Responsable",
        enableSorting: true,
        cell: (info) =>
          info.getValue() || (
            <span className="text-text-secondary italic">Non assigné</span>
          ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const client = row.original;
          const canEdit =
            isAdmin ||
            (client.assigned_to_user_id === user?.id &&
              client.status !== "Inactif");
          const canDelete = isAdmin;

          return (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => navigate(`/clients/modifier/${client.id}`)}
                title={
                  canEdit
                    ? "Modifier"
                    : "Modification désactivée (client inactif)"
                }
                disabled={!canEdit}
                className={`p-2 rounded-md transition-colors ${
                  canEdit
                    ? "hover:bg-blue-100 text-blue-600"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => canDelete && handleDelete(client)}
                title={
                  canDelete
                    ? "Supprimer"
                    : "Suppression désactivée (client inactif)"
                }
                disabled={!canDelete}
                className={`p-2 rounded-md transition-colors ${
                  canDelete
                    ? "hover:bg-red-100 text-red-600"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <Trash size={18} />
              </button>
            </div>
          );
        },
      },
    ],
    [navigate, isAdmin, user?.id]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Clients</h1>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-border rounded text-sm bg-bg text-text-primary dark:bg-muted dark:text-white"
            />
            <button
              onClick={() => window.location.reload()}
              title="Rafraîchir la page"
              className="p-2 rounded-full hover:bg-card text-text-secondary hover:text-primary transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a8 8 0 111.17 11.912l1.392 1.392a1 1 0 11-1.414 1.414l-3.536-3.535a1 1 0 010-1.415l3.536-3.535a1 1 0 111.414 1.414l-1.21 1.209A6 6 0 104 4z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isAdmin && (
              <Link
                to="/clients/nouveau"
                className="flex items-center gap-2 bg-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg"
              >
                <PlusCircle size={20} /> Ajouter un client
              </Link>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-card/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        className="px-6 py-3 text-sm font-semibold text-text-secondary uppercase tracking-wider cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          {
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            ) as React.ReactNode
                          }
                          {header.column.getCanSort() && (
                            <>
                              {isSorted === "asc" && <ArrowUpAZ size={14} />}
                              {isSorted === "desc" && <ArrowDownAZ size={14} />}
                            </>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border hover:bg-bg">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-text-primary"
                    >
                      {
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        ) as React.ReactNode
                      }
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-4 text-text-secondary italic"
                  >
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-text-secondary">
          <div>
            Page{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()}
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-card"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-card"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
