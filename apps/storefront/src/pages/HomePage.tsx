import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, CheckCircle2, MessageCircle, Sparkles, Award } from 'lucide-react';
import { Product, Category } from '@dropship/shared';
import { fetchCategories, fetchProducts } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { useStoreSettings } from '../context/StoreSettingsContext';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { whatsappNumber } = useStoreSettings();

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts({ featured: true, limit: 8 }),
        ]);
        setCategories(cats);
        setFeaturedProducts(prods.data);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Cash on Delivery Across All Pakistani Cities</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none mb-6">
              Trending Smart Gadgets & Everyday Innovations
            </h1>

            <p className="text-base sm:text-xl text-emerald-100/90 mb-8 leading-relaxed max-w-2xl">
              Discover tested gadgets, home essentials, and personal grooming tools. No credit card needed — inspect parcel seal upon arrival and pay cash directly to the courier officer.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/40 transition-all hover:gap-3"
              >
                Browse All Products
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                Order via WhatsApp
              </a>
            </div>

            {/* Quick Guarantees Bar */}
            <div className="mt-12 pt-8 border-t border-emerald-800/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>2-4 Days Fast Trax / Leopards</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Advance Risk</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>7-Day Replacement Policy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Shop By Category</h2>
            <p className="text-sm text-gray-500 mt-1">Explore our most requested product departments</p>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-200 aspect-[16/9] sm:aspect-[4/3] flex flex-col justify-end p-6"
            >
              {cat.image && (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />
              <div className="relative z-10 text-white">
                <h3 className="text-lg font-bold group-hover:text-emerald-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-1 mt-1">{cat.description}</p>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-3">
                  Shop Now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" /> Top Selling In Pakistan
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Products</h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse space-y-3">
                <div className="aspect-square bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 px-4 bg-emerald-50/60 rounded-3xl border border-emerald-100/80 space-y-4">
            <Sparkles className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">New Arrivals Arriving Soon!</h3>
            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
              We are curating high-demand, tested gadgets and daily essentials with nationwide Cash on Delivery. Stay tuned or message us directly on WhatsApp!
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Contact on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us / Trust Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 rounded-3xl p-8 sm:p-12 border border-emerald-100">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Transparent, Stress-Free Pakistani Online Shopping
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              We know ordering online in Pakistan can sometimes be unpredictable. That is why we operate with total transparency:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-gray-900">Phone Order Verification</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Before sending anything, our team will call your mobile number to confirm your address, city, and item details.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-gray-900">Track Parcel with Tracking ID</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Receive SMS and WhatsApp updates with official Trax or Leopards courier tracking numbers once dispatched.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-gray-900">Cash on Delivery (COD)</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pay the courier driver only when the parcel arrives at your doorstep. Zero financial risk for you.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

