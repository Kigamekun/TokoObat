import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { mockCart } from '../data/mock';

export const MedicineCard = ({ medicine }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);

    setTimeout(() => {
      mockCart.addItem(medicine);
      setIsAdding(false);
      setShowSuccess(true);

      // Update cart count in navigation
      window.dispatchEvent(new Event('cartUpdated'));

      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }, 500);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="medicine-card group w-[350px]">
      <div className="aspect-w-2 aspect-h-9 mb-4 overflow-hidden rounded-lg">
        <img
          src={`/` + medicine.img}
          alt={medicine.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </div>

      <div className="space-y-3">
        <div>
          <span className="inline-block px-3 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full mb-2">
            {medicine.category}
          </span>
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-teal-600 transition-colors">
            {medicine.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {medicine.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-teal-600">
              {formatPrice(medicine.price)}
            </p>
            <p className="text-sm text-gray-500">
              Stok: {medicine.stock} buah
            </p>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAdding || showSuccess || medicine.stock === 0}
          className={`w-full py-3 px-4 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            medicine.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : showSuccess
              ? 'bg-green-500 text-white'
              : isAdding
              ? 'bg-teal-400 text-white'
              : 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-lg'
          }`}
        >
          {medicine.stock === 0 ? (
            'Stok Habis'
          ) : showSuccess ? (
            <>
              <Check className="h-4 w-4" />
              Ditambahkan!
            </>
          ) : isAdding ? (
            'Menambahkan...'
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Tambah ke Keranjang
            </>
          )}
        </button>
      </div>
    </div>
  );
};
