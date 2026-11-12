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
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, X, Package, Search } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    } catch (err: any) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to load products from database',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
    if (categories.length > 0) setCategoryId(categories[0].id);
    if (suppliers.length > 0) setSupplierId(suppliers[0].id);
    setSupplierCostPkr(1500);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setCategoryId(p.categoryId);
    setShortDescription(p.shortDescription);
    setDescription(p.description);
    setBasePricePkr(p.basePricePkr);
    setCompareAtPricePkr(p.compareAtPricePkr || undefined);
    setSku(p.sku);
    setImageUrl(p.images[0]?.url || '');
    if (p.supplierOffers && p.supplierOffers.length > 0) {
      setSupplierId(p.supplierOffers[0].supplierId);
      setSupplierCostPkr(p.supplierOffers[0].supplierCostPkr);
    } else {
      setSupplierId(suppliers[0]?.id || '');
      setSupplierCostPkr(0);
    }
    setIsModalOpen(true);
  };

  const handleToggleActive = async (p: Product) => {
    try {
      const updated = await updateProduct(p.id, { isActive: !p.isActive });
      setProducts((prev) => prev.map((item) => (item.id === p.id ? updated : item)));
      setNotification({
        type: 'success',
        message: `Product "${p.name}" ${updated.isActive ? 'activated' : 'archived'} successfully!`,
      });
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to update product status' });
    }
  };

  const handleDelete = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!window.confirm(`Are you sure you want to permanently delete "${target?.name || 'this product'}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setNotification({
        type: 'success',
        message: 'Product permanently deleted from database.',
      });
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete product' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return; // Prevent duplicate submission
    setSaving(true);
    setNotification(null);

    try {
      const input: ProductCreateInput = {
        categoryId,
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        basePricePkr: Number(basePricePkr),
        compareAtPricePkr: compareAtPricePkr ? Number(compareAtPricePkr) : null,
        sku: sku.trim(),
        isActive: true,
        isFeatured: true,
        images: [{ id: 'img-1', url: imageUrl.trim(), isPrimary: true }],
        variants: (editingProduct?.variants || []).map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          priceDeltaPkr: v.priceDeltaPkr || 0,
          supplierCostDeltaPkr: v.supplierCostDeltaPkr || 0,
          isAvailable: v.isAvailable !== false,
        })),
        supplierOffers: supplierId
          ? [
              {
                supplierId,
                supplierSku: `SUP-${sku.trim()}`,
                supplierCostPkr: Number(supplierCostPkr),
                isAvailable: true,
                leadTimeDays: 1,
              },
            ]
          : [],
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, input as any);
        setNotification({
          type: 'success',
          message: `Product "${input.name}" updated successfully in database!`,
        });
      } else {
        await createProduct(input);
        setNotification({
          type: 'success',
          message: `Product "${input.name}" saved permanently in database!`,
        });
      }

      setIsModalOpen(false);
      // Reload products directly from database to verify persistence
      await loadData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to save product to database',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Notification Toast */}
      {notification && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-semibold shadow-sm transition-all animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
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
          className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3 pointer-events-none" />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-xs text-gray-500 font-medium">Loading catalog from database...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-800 text-sm">Product Catalog is Empty</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No products found in the catalog. Click below to add your first product!
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Product Now
            </button>
          </div>
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
                          src={p.images[0]?.url || 'https://placehold.co/100x100?text=No+Image'}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
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
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            p.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Archived'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer inline-block"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer inline-block"
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

      {/* Create / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                {editingProduct ? 'Edit Product Details' : 'Add New Dropshipping Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
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
                    if (!editingProduct) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  className="w-full p-2.5 border rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                    className="w-full p-2.5 border rounded-xl mt-1 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl mt-1 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
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
                    className="w-full p-2.5 border rounded-xl mt-1 font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Compare Price (PKR)</label>
                  <input
                    type="number"
                    value={compareAtPricePkr || ''}
                    onChange={(e) => setCompareAtPricePkr(parseInt(e.target.value, 10) || undefined)}
                    className="w-full p-2.5 border rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. 3500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700">SKU *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-2.5 border rounded-xl mt-1 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                      <option key={s.id} value={s.id}>
                        {s.businessName} ({s.city})
                      </option>
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
                <label className="font-semibold text-gray-700">Image URL (Persistent Storage / CDN) *</label>
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 p-2.5 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="https://images.unsplash.com/... or CDN URL"
                  />
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Use permanent image URLs (e.g. Unsplash, Supabase Storage, Cloudinary, AWS S3)
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Short Summary *</label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full p-2.5 border rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  className="w-full p-2.5 border rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{editingProduct ? 'Saving changes...' : 'Publishing product...'}</span>
                    </>
                  ) : editingProduct ? (
                    'Update Product'
                  ) : (
                    'Publish Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
