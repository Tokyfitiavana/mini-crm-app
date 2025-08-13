import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Swal from "../utils/swal";
import { Trash, CheckCircle , FileDown} from "lucide-react";

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Sale {
  id: number;
  product_id: number;
  quantity: number;
  sale_date: string;
  total_price: number | string;
  product_name: string;
}

const SalesManager = () => {
  const API_BASE_URL = "http://localhost:3001";
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [quantitySold, setQuantitySold] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [selectedSales, setSelectedSales] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (error) {
      console.error("Erreur fetchProducts:", error);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSales(data);
        setFilteredSales(data);
      }
    } catch (error) {
      console.error("Erreur fetchSales:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  useEffect(() => {
    let filtered = [...sales];
    if (search) {
      filtered = filtered.filter((s) =>
        s.product_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterPeriod !== "all") {
      const now = new Date();
      filtered = filtered.filter((s) => {
        const saleDate = new Date(s.sale_date);
        if (filterPeriod === "today") {
          return saleDate.toDateString() === now.toDateString();
        } else if (filterPeriod === "week") {
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          return saleDate >= oneWeekAgo;
        } else if (filterPeriod === "month") {
          return (
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear()
          );
        }
        return true;
      });
    }
    setFilteredSales(filtered);
  }, [search, filterPeriod, sales]);

  const handleSale = async () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return Swal.fire("Erreur", "Produit introuvable", "error");
    if (quantitySold <= 0 || quantitySold > product.quantity) {
      return Swal.fire("Quantité invalide", "Stock insuffisant", "warning");
    }
    const total_price = quantitySold * product.price;
    const result = await Swal.fire({
      title: "Confirmer la vente",
      html: `Produit: <b>${
        product.name
      }</b><br/>Quantité: ${quantitySold}<br/>Total: <b>${total_price.toFixed(
        2
      )} €</b>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Valider",
      cancelButtonText: "Annuler",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`${API_BASE_URL}/api/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: selectedProductId,
        quantity: quantitySold,
        total_price,
      }),
    });
    if (res.ok) {
      Swal.fire("Succès", "Vente enregistrée", "success");
      setQuantitySold(1);
      await fetchProducts();
      await fetchSales();
    } else {
      Swal.fire("Erreur", "Échec de l'enregistrement", "error");
    }
  };

  const handleDeleteSelected = async () => {
    const confirm = await Swal.fire({
      title: "Supprimer",
      text: "Confirmez-vous la suppression des ventes sélectionnées ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });
    if (!confirm.isConfirmed) return;
    for (const id of selectedSales) {
      await fetch(`${API_BASE_URL}/api/sales/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    await fetchSales();
    setSelectedSales([]);
    setSelectAll(false);
    Swal.fire("Supprimé", "Les ventes ont été supprimées.", "success");
  };

  const handleDeleteSingle = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Supprimer",
      text: "Confirmez-vous la suppression de cette vente ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });
    if (!confirm.isConfirmed) return;
    await fetch(`${API_BASE_URL}/api/sales/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchSales();
    Swal.fire("Supprimé", "La vente a été supprimée.", "success");
  };

  const handleSelectSale = (id: number) => {
    setSelectedSales((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedSales(selectAll ? [] : filteredSales.map((s) => s.id));
  };

  const exportCSV = () => {
    const rows = [["Date", "Produit", "Quantité", "Total (€)"]];
    filteredSales.forEach((s) => {
      rows.push([
        new Date(s.sale_date).toLocaleString("fr-FR"),
        s.product_name,
        s.quantity.toString(),
        s.total_price ? Number(s.total_price).toFixed(2) : "0.00",
      ]);
    });
    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "ventes.csv");
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Gestion des ventes
        </h1>
        {userRole === "admin" && (
          <div className="bg-bg shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Enregistrer une vente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="border border-border bg-bg text-text-primary rounded px-4 py-2"
              >
                <option value={0}>-- Choisir un produit --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.quantity})
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantité vendue"
                className="border border-border bg-bg text-text-primary rounded px-4 py-2"
                min={1}
                value={quantitySold}
                onChange={(e) => setQuantitySold(Number(e.target.value))}
              />
              <button
                onClick={handleSale}
                className="bg-primary text-white text-sm font-medium w-[2cm] h-[1cm] rounded-md hover:bg-opacity-90 flex items-center justify-center"
                title="Valider la vente"
              >
                <CheckCircle size={18} />
              </button>
            </div>
          </div>
        )}
        <div className="bg-bg shadow-md rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Historique des ventes</h2>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                placeholder="Recherche produit..."
                className="px-3 py-2 border border-border rounded text-sm bg-bg text-text-primary dark:bg-muted dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 border border-border rounded text-sm bg-bg text-text-primary dark:bg-muted dark:text-white"
              >
                <option value="all">Toutes les périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">7 derniers jours</option>
                <option value="month">Ce mois-ci</option>
              </select>
              <button
                onClick={exportCSV}
                className="w-[2cm] h-[1cm] rounded bg-primary text-white flex items-center justify-center"
                title="Exporter en CSV"
              >
                <FileDown size={18} />
              </button>

              {userRole === "admin" && selectedSales.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="w-[2cm] h-[1cm] rounded bg-red-600 text-white flex items-center justify-center"
                  title="Supprimer la sélection"
                >
                  <Trash size={18} />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="text-xs text-text-secondary uppercase bg-surface">
                <tr>
                  <th className="px-2 py-3">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Produit</th>
                  <th className="px-6 py-3">Quantité</th>
                  <th className="px-6 py-3">Total (€)</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-border hover:bg-surface"
                  >
                    <td className="px-2 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSales.includes(sale.id)}
                        onChange={() => handleSelectSale(sale.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      {new Date(sale.sale_date).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">{sale.product_name}</td>
                    <td className="px-6 py-4">{sale.quantity}</td>
                    <td className="px-6 py-4">
                      {Number(sale.total_price).toLocaleString("fr-FR")} €
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteSingle(sale.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSales.length === 0 && (
            <p className="text-center text-text-secondary mt-4">
              Aucune vente enregistrée.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalesManager;
