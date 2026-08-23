'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Package, Plus, Trash2, Edit, Save, Search, Check, AlertCircle, X } from 'lucide-react';
import { Product } from '../../../types';
import { initialProducts, initialCategories } from '../../../lib/mockData';
import { formatINR } from '../../../lib/utils';
import { apiClient } from '../../../lib/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Product Form State
  const [newProd, setNewProd] = useState({
    title: '',
    brand: '',
    categorySlug: 'mobiles-tablets',
    price: 10000,
    originalPrice: 12000,
    stock: 50,
    thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80',
    description: '',
    isPrimeEligible: true,
    isBestSeller: false,
    isAmazonChoice: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Fetch live products
  useEffect(() => {
    const fetchProds = async () => {
      try {
        const res = await apiClient.get('/admin/products');
        if (res.data?.products && res.data.products.length > 0) {
          setProducts(res.data.products);
        }
      } catch (e) {
        // Fallback to initialProducts
      }
    };
    fetchProds();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.title || !newProd.brand || !newProd.price) {
      setMsg('Please fill in required fields.');
      return;
    }

    setIsLoading(true);
    setMsg('');

    try {
      const payload = {
        ...newProd,
        slug: newProd.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        images: [newProd.thumbnail],
        rating: 4.5,
        numReviews: 1,
      };

      const res = await apiClient.post('/admin/products', payload);
      const created = res.data?.product || { ...payload, _id: `prod_${Date.now()}` };

      setProducts([created, ...products]);
      setIsAddModalOpen(false);
      setMsg('Product created successfully!');
    } catch (err: any) {
      const offlineProd: Product = {
        _id: `prod_${Date.now()}`,
        ...newProd,
        category: `cat_${newProd.categorySlug}`,
        slug: newProd.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        images: [newProd.thumbnail],
        rating: 4.5,
        numReviews: 1,
        isLightningDeal: false,
        variants: [],
        features: [],
        specifications: {},
        discountPercentage: Math.round(((newProd.originalPrice - newProd.price) / newProd.originalPrice) * 100),
        tags: [newProd.brand.toLowerCase()],
      };
      setProducts([offlineProd, ...products]);
      setIsAddModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStockPrice = async (id: string, newStock: number, newPrice: number) => {
    try {
      await apiClient.put(`/admin/products/${id}`, { stock: newStock, price: newPrice });
    } catch (e) {
      // Local state update
    }
    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, stock: newStock, price: newPrice } : p))
    );
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiClient.delete(`/admin/products/${id}`);
    } catch (e) {
      // Local update
    }
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Product & Inventory Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create new SKUs, adjust pricing, update live stock counts, and toggle Prime badges
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#131926] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog by title or brand..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-xs text-gray-900 dark:text-white"
          />
        </div>
        <span className="text-gray-500 font-semibold">{filteredProducts.length} items total</span>
      </div>

      {/* Product List Table */}
      <div className="bg-white dark:bg-[#131926] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Brand</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock Inventory</th>
                <th className="p-3">Badges</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-10 h-10 object-contain bg-white p-1 rounded border border-gray-200"
                    />
                    <span className="font-bold text-gray-900 dark:text-white line-clamp-1 max-w-xs">
                      {product.title}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-gray-700 dark:text-gray-300">{product.brand}</td>
                  <td className="p-3 capitalize text-gray-500">{product.categorySlug.replace('-', ' ')}</td>
                  <td className="p-3 font-bold text-amazon-deal-red">{formatINR(product.price)}</td>
                  <td className="p-3">
                    <span
                      className={`font-black px-2 py-0.5 rounded text-[11px] ${
                        product.stock < 10
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {product.isPrimeEligible && (
                        <span className="bg-blue-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded">
                          prime
                        </span>
                      )}
                      {product.isBestSeller && (
                        <span className="bg-amazon-orange text-white font-bold text-[9px] px-1.5 py-0.2 rounded">
                          Best Seller
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#131926] rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="bg-[#f0f2f2] dark:bg-gray-800 px-6 py-4 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Add New Product to Catalog</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProd.title}
                  onChange={(e) => setNewProd({ ...newProd, title: e.target.value })}
                  placeholder="e.g. Sony Bravia 55-inch 4K Smart TV"
                  className="w-full px-3 py-1.5 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={newProd.brand}
                    onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                    placeholder="e.g. Sony"
                    className="w-full px-3 py-1.5 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Category</label>
                  <select
                    value={newProd.categorySlug}
                    onChange={(e) => setNewProd({ ...newProd, categorySlug: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {initialCategories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">M.R.P. (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProd.originalPrice}
                    onChange={(e) => setNewProd({ ...newProd, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={newProd.thumbnail}
                  onChange={(e) => setNewProd({ ...newProd, thumbnail: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={newProd.isPrimeEligible}
                    onChange={(e) => setNewProd({ ...newProd, isPrimeEligible: e.target.checked })}
                    className="text-amazon-orange rounded"
                  />
                  <span>Prime Delivery</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={newProd.isBestSeller}
                    onChange={(e) => setNewProd({ ...newProd, isBestSeller: e.target.checked })}
                    className="text-amazon-orange rounded"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-amazon-btn-yellow font-bold text-amazon-dark-text rounded shadow-sm"
                >
                  {isLoading ? 'Creating SKU...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
