import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Plus, Trash2, Pencil } from "lucide-react";
import Swal from "../utils/swal";

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface NewProduct {
  name: string;
  quantity: number;
  price: number;
}

const StockManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    quantity: 0,
    price: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  const API_BASE_URL = "http://localhost:3001";

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Unauthorized");
      const data = await response.json();

      if (Array.isArray(data)) {
        const parsedProducts = data.map((p) => ({
          ...p,
          price: parseFloat(p.price),
          quantity: parseInt(p.quantity),
        }));
        setProducts(parsedProducts);
      } else {
        throw new Error("Données non valides");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement du stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    const result = await Swal.fire({
      title: "Confirmer l'ajout",
      text: "Voulez-vous vraiment ajouter ce produit ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Oui, ajouter",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) throw new Error("Échec de l'ajout");

      await fetchProducts();
      setNewProduct({ name: "", quantity: 0, price: 0 });

      Swal.fire("Ajouté", "Produit ajouté avec succès.", "success");
    } catch {
      Swal.fire("Erreur", "Impossible d'ajouter le produit.", "error");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const result = await Swal.fire({
      title: "Supprimer le produit ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("authToken");
      await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchProducts();
      Swal.fire("Supprimé", "Le produit a été supprimé.", "success");
    } catch {
      Swal.fire("Erreur", "Suppression échouée.", "error");
    }
  };

  const handleEditProduct = async (product: Product) => {
    const { value: formValues } = await Swal.fire({
      title: "Modifier le produit",
      html: `
        <input id="name" class="swal2-input" placeholder="Nom" value="${product.name}" />
        <input id="quantity" type="number" class="swal2-input" placeholder="Quantité" value="${product.quantity}" />
        <input id="price" type="number" class="swal2-input" placeholder="Prix (€)" value="${product.price}" />
      `,
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById("name") as HTMLInputElement).value;
        const quantity = parseInt((document.getElementById("quantity") as HTMLInputElement).value);
        const price = parseFloat((document.getElementById("price") as HTMLInputElement).value);
        if (!name || isNaN(quantity) || isNaN(price)) {
          Swal.showValidationMessage("Tous les champs sont requis.");
          return;
        }
        return { name, quantity, price };
      },
      showCancelButton: true,
      confirmButtonText: "Modifier",
      cancelButtonText: "Annuler",
    });

    if (!formValues) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) throw new Error("Erreur lors de la modification");

      await fetchProducts();
      Swal.fire("Modifié", "Le produit a été mis à jour.", "success");
    } catch {
      Swal.fire("Erreur", "Échec de la modification.", "error");
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold text-text-primary">Gestion de Stock</h1>

        <input
          type="text"
          placeholder="Recherche par nom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 border border-border rounded px-4 py-2 bg-bg text-text-primary"
        />

        {userRole === "admin" && (
          <div className="bg-bg border border-border shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Ajouter un nouveau produit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Nom du produit"
                className="border border-border rounded px-4 py-2 bg-bg text-text-primary"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Quantité"
                className="border border-border rounded px-4 py-2 bg-bg text-text-primary"
                value={newProduct.quantity}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    quantity: Number(e.target.value) || 0,
                  })
                }
              />
              <input
                type="number"
                placeholder="Prix (€)"
                className="border border-border rounded px-4 py-2 bg-bg text-text-primary"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: Number(e.target.value) || 0,
                  })
                }
              />
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-opacity-90 transition"
              >
                <Plus size={16} /> Ajouter
              </button>
            </div>
          </div>
        )}

        <div className="bg-bg border border-border shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Liste des produits
          </h2>

          {loading ? (
            <p className="text-text-secondary">Chargement...</p>
          ) : error ? (
            <p className="text-red-500">Erreur : {error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-text-secondary">
                <thead className="text-xs uppercase bg-muted text-text-primary">
                  <tr>
                    <th className="px-6 py-3">Nom</th>
                    <th className="px-6 py-3">Quantité</th>
                    <th className="px-6 py-3">Prix (€)</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="px-6 py-4">{product.name}</td>
                      <td className={`px-6 py-4 ${product.quantity === 0 ? 'text-red-500' : product.quantity < 5 ? 'text-orange-500' : ''}`}>{product.quantity}</td>
                      <td className="px-6 py-4">
                        {typeof product.price === "number"
                          ? product.price.toFixed(2)
                          : "0.00"} €
                      </td>
                      <td className="px-6 py-4 text-right">
                        {userRole === "admin" && (
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                              title="Modifier"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <p className="text-center text-text-secondary mt-4">
                  Aucun produit ne correspond à la recherche.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StockManager;
