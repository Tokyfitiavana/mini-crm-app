import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Swal from "../utils/swal";

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
  total_price: number;
  product_name: string;
}

const SalesManager = () => {
  const API_BASE_URL = "http://localhost:3001";

  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [quantitySold, setQuantitySold] = useState<number>(1); 

  const fetchProducts = async () => {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    const data = await res.json();
    setProducts(data);
  };

  const fetchSales = async () => {
    const res = await fetch(`${API_BASE_URL}/api/sales`);
    const data = await res.json();
    setSales(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  const handleSale = async () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return Swal.fire("Erreur", "Produit introuvable", "error");

    if (quantitySold <= 0 || quantitySold > product.quantity) {
      return Swal.fire(
        "Quantité invalide",
        "Vérifiez que la quantité ne dépasse pas le stock",
        "warning"
      );
    }

    const total_price = quantitySold * product.price;

    const result = await Swal.fire({
      title: "Confirmer la vente",
      html: `Produit : <strong>${
        product.name
      }</strong><br/>Quantité : ${quantitySold}<br/>Total : <strong>${total_price.toFixed(
        2
      )} €</strong>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Valider",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    const res = await fetch(`${API_BASE_URL}/api/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      Swal.fire("Erreur", "Impossible d'enregistrer la vente", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des ventes</h1>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Enregistrer une vente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              className="border border-gray-300 rounded px-4 py-2"
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
              className="border border-gray-300 rounded px-4 py-2"
              min={1}
              value={quantitySold}
              onChange={(e) => setQuantitySold(Number(e.target.value))}
            />

            <button
              onClick={handleSale}
              className="bg-green-600 text-white font-medium px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Valider la vente
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Historique des ventes
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Produit</th>
                  <th className="px-6 py-3">Quantité</th>
                  <th className="px-6 py-3">Total (€)</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {new Date(sale.sale_date).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">{sale.product_name}</td>
                    <td className="px-6 py-4">{sale.quantity}</td>
                    <td className="px-6 py-4">
                      {sale.total_price.toLocaleString("fr-FR")} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sales.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              Aucune vente enregistrée.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalesManager;
