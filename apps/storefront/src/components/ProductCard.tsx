import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Truck } from 'lucide-react';
import { Product, formatPkr, buildSingleProductWhatsAppLink } from '@dropship/shared';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface ProductCardProps {
  product: Product;
  whatsappNumber?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  whatsappNumber = '923001234567',
}) => {
  const { addToCart } = useCart();
  const { isLoggedIn, openAuthModal } = useCustomerAuth();
  const primaryImage = product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url;

  const discountPercent =
    product.compareAtPricePkr && product.compareAtPricePkr > product.basePricePkr
      ? Math.round(((product.compareAtPricePkr - product.basePricePkr) / product.compareAtPricePkr) * 100)
      : null;

  const whatsappLink = buildSingleProductWhatsAppLink({
    businessPhone: whatsappNumber,
    productName: product.name,
    pricePkr: product.basePricePkr,
    productUrl: `${window.location.origin}/product/${product.slug}`,
  });

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      {/* Product Image Box */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square bg-gray-100 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Image Available
          </div>
        )}

        {/* Discount Badge */}
        {discountPercent && (
          <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Save {discountPercent}%
          </span>
        )}

        {/* COD Badge */}
        <span className="absolute bottom-2.5 left-2.5 bg-emerald-900/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
          <Truck className="w-3 h-3 text-emerald-400" />
          Cash on Delivery
        </span>
      </Link>

      {/* Product Meta */}
      <div className="p-4 flex flex-col flex-1">
        {product.categoryName && (
          <span className="text-[11px] font-medium text-emerald-700 tracking-wider uppercase mb-1">
            {product.categoryName}
          </span>
        )}

        <Link
          to={`/product/${product.slug}`}
          className="font-semibold text-gray-900 text-base line-clamp-2 hover:text-emerald-600 transition-colors mb-1.5"
          title={product.name}
        >
          {product.name}
        </Link>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {product.shortDescription}
        </p>

        {/* Price & Actions */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPkr(product.basePricePkr)}
            </span>
            {product.compareAtPricePkr && (
              <span className="text-xs text-gray-400 line-through">
                {formatPkr(product.compareAtPricePkr)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  openAuthModal({
                    mode: 'action',
                    title: 'Add to Cart 🛒',
                    description: 'Sign in to save this product to your account, or continue adding as a guest.',
                    onContinue: () => addToCart(product, 1),
                  });
                } else {
                  addToCart(product, 1);
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 text-xs font-semibold border border-gray-200 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

