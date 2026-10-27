import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, RefreshCw, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">About ApnaBuy</h1>
    <p className="text-sm text-gray-600 leading-relaxed">
      ApnaBuy is a modern, transparent Pakistani ecommerce brand built to make high-utility gadgets, kitchen innovations, and personal grooming tools accessible with absolute zero financial risk.
    </p>
    <p className="text-sm text-gray-600 leading-relaxed">
      Operating directly through vetted dropshipping suppliers in Lahore and Karachi, we ensure that every product is tested for functionality before being sealed and dispatched via trusted national courier partners (Trax, Leopards, Call Courier, TCS).
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2">
        <Truck className="w-6 h-6 text-emerald-600" />
        <h3 className="font-bold text-gray-900 text-sm">Nationwide Reach</h3>
        <p className="text-xs text-gray-500">Delivering to over 250+ cities and tehsils across Pakistan.</p>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2">
        <ShieldCheck className="w-6 h-6 text-emerald-600" />
        <h3 className="font-bold text-gray-900 text-sm">100% Cash on Delivery</h3>
        <p className="text-xs text-gray-500">No bank transfers or credit cards needed. Pay only on your doorstep.</p>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2">
        <RefreshCw className="w-6 h-6 text-emerald-600" />
        <h3 className="font-bold text-gray-900 text-sm">7-Day Replacement</h3>
        <p className="text-xs text-gray-500">Fast replacement if an item arrives damaged or broken.</p>
      </div>
    </div>
  </div>
);

export const ContactPage: React.FC = () => {
  const { whatsappNumber, supportPhone, supportEmail } = useStoreSettings();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Support & Inquiries</h1>
        <p className="text-sm text-gray-500">Have a question about an order or want to place an order via WhatsApp? We are here to help!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">WhatsApp Support</h3>
          <p className="text-xs text-gray-500">Instant answers for tracking, orders, and inquiries.</p>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
          >
            Chat on WhatsApp: {supportPhone || whatsappNumber} &rarr;
          </a>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">Email Support</h3>
          <p className="text-xs text-gray-500">For business proposals, bulk orders, and return claims.</p>
          <a
            href={`mailto:${supportEmail}`}
            className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
          >
            {supportEmail} &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};

export const FaqPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Frequently Asked Questions</h1>
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2">
        <h3 className="font-bold text-gray-900 text-sm">How does Cash on Delivery (COD) work?</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          You place your order through our website or WhatsApp. Our agent calls you to confirm your address. Once confirmed, we dispatch your parcel via Trax or Leopards. When the delivery rider arrives at your house, you hand over the exact cash amount and take the package.
        </p>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2">
        <h3 className="font-bold text-gray-900 text-sm">How long does delivery take?</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Delivery generally takes 2 to 4 business days for major cities (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad) and 3 to 5 business days for other regional areas.
        </p>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2">
        <h3 className="font-bold text-gray-900 text-sm">Can I open the parcel before paying?</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Couriers in Pakistan require collection of the COD amount before handing over custody of the parcel due to standard courier safety guidelines. However, if there is any issue after opening, you are 100% protected under our 7-day easy replacement policy!
        </p>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2">
        <h3 className="font-bold text-gray-900 text-sm">Can I order directly on WhatsApp?</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Yes! Every product page has an "Order on WhatsApp" button that prepares a ready-to-send message with product name, price, and your details.
        </p>
      </div>
    </div>
  </div>
);

export const ShippingPolicyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-sm text-gray-600 leading-relaxed">
    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shipping & Delivery Policy</h1>
    <p>
      1. <strong>Delivery Coverage:</strong> We deliver to all residential and commercial addresses across Pakistan where courier coverage exists.
    </p>
    <p>
      2. <strong>Delivery Charges:</strong> Standard shipping fee across Pakistan is Rs. 250. Orders of Rs. 3,500 or more qualify for FREE delivery.
    </p>
    <p>
      3. <strong>Order Verification:</strong> All Cash on Delivery orders require telephone or WhatsApp confirmation before parcel handover to the courier. If our team is unable to reach you after 3 attempts, the order may be cancelled.
    </p>
    <p>
      4. <strong>Delivery Timeline:</strong> Major cities: 2 to 4 business days. Outlying areas: 3 to 5 business days. Dispatch delays may occur during public holidays or extreme weather events.
    </p>
  </div>
);

export const ReturnPolicyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-sm text-gray-600 leading-relaxed">
    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Return & Replacement Policy</h1>
    <p>
      We want you to order with complete confidence.
    </p>
    <p>
      1. <strong>7-Day Replacement Guarantee:</strong> If your product arrives broken, physically damaged, or non-functional, contact our WhatsApp support within 7 days of delivery.
    </p>
    <p>
      2. <strong>Claim Process:</strong> Send a short video showing the defect along with your Order Reference number on WhatsApp (0300 1234567). Our support team will review and approve a replacement.
    </p>
    <p>
      3. <strong>Return Shipping:</strong> In case of manufacturing defects or incorrect items dispatched, reverse pickup is arranged at zero extra cost to the customer.
    </p>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-sm text-gray-600 leading-relaxed">
    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Terms and Conditions</h1>
    <p>
      By using this website and placing an order via Cash on Delivery or WhatsApp, you agree to these terms.
    </p>
    <p>
      1. <strong>Accuracy of Information:</strong> You agree to provide accurate name, mobile number, and delivery address. False or prank orders result in blacklisting from our delivery network.
    </p>
    <p>
      2. <strong>Pricing and Availability:</strong> All prices are displayed in Pakistani Rupees (PKR). Product availability is subject to change based on supplier stock.
    </p>
    <p>
      3. <strong>Payment:</strong> Payment must be made in Pakistani Rupees cash to the courier representative upon delivery.
    </p>
  </div>
);

export const PrivacyPolicyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-sm text-gray-600 leading-relaxed">
    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
    <p>
      Your privacy is essential to us. This policy describes how we handle your personal information.
    </p>
    <p>
      1. <strong>Information Collected:</strong> When you place an order, we collect your name, mobile number, delivery address, and city for the sole purpose of order verification, fulfilment, and delivery.
    </p>
    <p>
      2. <strong>Courier Sharing:</strong> Your name, phone number, and address are shared only with our fulfillment dropshipping supplier and authorized courier partner (Trax, Leopards, TCS) for delivery.
    </p>
    <p>
      3. <strong>Zero Payment Card Data:</strong> We do not ask for, collect, or store any credit card, debit card, or bank account details.
    </p>
  </div>
);

export const NotFoundPage: React.FC = () => (
  <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
    <h1 className="text-6xl font-black text-emerald-600">404</h1>
    <h2 className="text-xl font-bold text-gray-900">Page Not Found</h2>
    <p className="text-xs text-gray-500">The page you requested could not be found or has moved.</p>
    <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold">
      Return to Home
    </Link>
  </div>
);

