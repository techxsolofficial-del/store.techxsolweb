import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Product,
  formatPkr,
  buildSingleProductWhatsAppLink,
  buildWhatsAppOrderLink,
} from '@dropship/shared';
import { fetchProductBySlug, fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { ProductCard } from '../components/ProductCard';
import {
  ShoppingCart,
  MessageCircle,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { isLoggedIn, openAuthModal } = useCustomerAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await fetchProductBySlug(slug);
        setProduct(prod);
        setSelectedImage(prod.images[0]?.url || '');
        if (prod.variants && prod.variants.length > 0) {
          const available = prod.variants.find((v: any) => v.isAvailable) || prod.variants[0];
          setSelectedVariantId(available.id);
        }
        // Load related items
        const rel = await fetchProducts({ category: prod.categorySlug, limit: 4 });
        setRelatedProducts(rel.data.filter((p: any) => p.id !== prod.id));
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-28 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Product not found</h2>
        <p className="text-sm text-gray-500">The product you are looking for is no longer available.</p>
        <Link to="/shop" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const selectedVariant = product.variants?.find((v: any) => v.id === selectedVariantId);
  const currentPrice = product.basePricePkr + (selectedVariant?.priceDeltaPkr || 0);

  const discountPercent =
    product.compareAtPricePkr && product.compareAtPricePkr > currentPrice
      ? Math.round(((product.compareAtPricePkr - currentPrice) / product.compareAtPricePkr) * 100)
      : null;

  const executeAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariant?.id, selectedVariant?.name);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!isLoggedIn) {
      openAuthModal({
        mode: 'action',
        title: 'Add to Cart 🛒',
        description: 'Sign in to save this product to your account, or continue as a guest.',
        onContinue: executeAddToCart,
      });
    } else {
      executeAddToCart();
    }
  };

  const directWhatsAppLink = buildWhatsAppOrderLink({
    businessPhone: '923001234567',
    items: [
      {
        name: product.name,
        variantName: selectedVariant?.name,
        quantity,
        unitPricePkr: currentPrice,
      },
    ],
    subtotalPkr: currentPrice * quantity,
    deliveryChargePkr: currentPrice * quantity >= 3500 ? 0 : 250,
    totalPkr: currentPrice * quantity + (currentPrice * quantity >= 3500 ? 0 : 250),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-emerald-600">Shop</Link>
        {product.categoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/shop?category=${product.categorySlug}`} className="hover:text-emerald-600">
              {product.categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-sm relative">
            <img
              src={selectedImage || product.images[0]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Save {discountPercent}% OFF
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img.url
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-6">
          <div>
            <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-md mb-2">
              In Stock - Nationwide COD
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
              {product.name}
            </h1>
            <p className="text-xs text-gray-400 mt-1">SKU: {selectedVariant?.sku || product.sku}</p>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900">
              {formatPkr(currentPrice)}
            </span>
            {product.compareAtPricePkr && (
              <span className="text-sm text-gray-400 line-through">
                {formatPkr(product.compareAtPricePkr)}
              </span>
            )}
            <span className="ml-auto text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
              Cash on Delivery Available
            </span>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Select Option / Edition:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariantId === v.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Quantity:
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-sm">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 font-bold"
              >
                -
              </button>
              <span className="px-4 py-1.5 text-sm font-bold text-gray-900 select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="px-3.5 py-1.5 text-gray-600 hover:bg-gray-100 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              <a
                href={directWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-sm border border-emerald-300 transition-all"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                Order on WhatsApp
              </a>
            </div>

            {addedToast && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Added to cart!</span>
                <Link to="/cart" className="underline font-bold ml-auto">
                  View Cart & Checkout &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Delivery & Security Badges Box */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/70 space-y-3 text-xs text-gray-600">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Fast Delivery:</strong> 2 to 4 business days across Pakistan via Trax / Leopards.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Cash on Delivery:</strong> Inspect parcel seal upon arrival, pay cash to courier.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>7-Day Guarantee:</strong> Quick replacement for defective or damaged goods.
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
              Product Overview
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Related Products You May Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

