import React, { useEffect, useState } from 'react';
import { Product, Category, Supplier, formatPkr, ProductCreateInput } from '@dropship/shared';
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAdminCategories,
  fetchAdminSuppliers,
} from '../services/api';
import { Plus, Edit2, Trash2, Check, X, Package, Search } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [basePricePkr, setBasePricePkr] = useState(2500);
  const [compareAtPricePkr, setCompareAtPricePkr] = useState<number | undefined>(3500);
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [supplierCostPkr, setSupplierCostPkr] = useState(1500);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsRes, cats, sups] = await Promise.all([
        fetchAdminProducts({ search: search || undefined }),
        fetchAdminCategories(),
        fetchAdminSuppliers(),
      ]);
      setProducts(prodsRes.data);
      setCategories(cats);
      setSuppliers(sups);
      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
      if (sups.length > 0 && !supplierId) setSupplierId(sups[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setShortDescription('');
    setDescription('');
    setBasePricePkr(2500);
    setCompareAtPricePkr(3500);
    setSku(`SKU-${Date.now().toString().slice(-6)}`);
    setImageUrl('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (p: Product) => {
    try {
      const updated = await updateProduct(p.id, { isActive: !p.isActive });
      setProducts((prev) => prev.map((item) => (item.id === p.id ? updated : item)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const input: ProductCreateInput = {
        categoryId,
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        shortDescription,
        description,
        basePricePkr,
        compareAtPricePkr: compareAtPricePkr || null,
        sku,
        isActive: true,
        isFeatured: true,
        images: [{ id: 'img-1', url: imageUrl, isPrimary: true }],
        variants: [],
        supplierOffers: supplierId
          ? [
              {
                supplierId,
                supplierSku: `SUP-${sku}`,
                supplierCostPkr,
                isAvailable: true,
                leadTimeDays: 1,
              },
            ]
          : [],
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, input as any);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      } else {
        const created = await createProduct(input);
        setProducts((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your dropshipping catalog, selling prices, wholesale supplier costs, and visibility
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search products by title or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-gray-300 bg-white"
        />
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3 pointer-events-none" />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Product Name & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Supplier Cost</th>
                  <th className="py-3 px-4">Estimated Margin</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {products.map((p) => {
                  const supCost = p.supplierOffers?.[0]?.supplierCostPkr || 0;
                  const margin = p.basePricePkr - supCost;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={p.images[0]?.url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        />
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-gray-900 truncate">{p.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{p.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{p.categoryName || 'Unassigned'}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{formatPkr(p.basePricePkr)}</td>
                      <td className="py-3 px-4 text-gray-500">{formatPkr(supCost)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">+{formatPkr(margin)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Archived'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Add New Dropshipping Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingProduct) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  className="w-full p-2.5 border rounded-xl mt-1"
                  placeholder="e.g. Ultra Fast Wireless Charger"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full p-2.5 border rounded-xl mt-1 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl mt-1 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700">Selling Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={basePricePkr}
                    onChange={(e) => setBasePricePkr(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 border rounded-xl mt-1 font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Compare Price (PKR)</label>
                  <input
                    type="number"
                    value={compareAtPricePkr || ''}
                    onChange={(e) => setCompareAtPricePkr(parseInt(e.target.value, 10) || undefined)}
                    className="w-full p-2.5 border rounded-xl mt-1"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700">SKU *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-2.5 border rounded-xl mt-1 font-mono"
                  />
                </div>
              </div>

              {/* Dropshipping Supplier Cost */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-emerald-950">Primary Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full p-2 border rounded-lg mt-1 bg-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.businessName} ({s.city})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-emerald-950">Wholesale Cost (PKR)</label>
                  <input
                    type="number"
                    value={supplierCostPkr}
                    onChange={(e) => setSupplierCostPkr(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 border rounded-lg mt-1 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Image URL *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 border rounded-xl mt-1 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Short Summary *</label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full p-2.5 border rounded-xl mt-1"
                  placeholder="One sentence value proposition..."
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Full Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border rounded-xl mt-1"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  {saving ? 'Saving...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

