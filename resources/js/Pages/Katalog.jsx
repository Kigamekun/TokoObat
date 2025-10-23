import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { MedicineCard } from '../components/MedicineCard';
import '../../css/applanding.css';
import '../../css/app.css';
import '../../css/pharmacy.css';
import { Navigation } from '../components/Navigation';

export default function Katalog() {
  const { props } = usePage();
  const medicines = props.medicines || [];
  const categories = ['Semua', ...(props.categories || [])];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredMedicines = useMemo(() => {
    let filtered = medicines.filter(medicine => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medicine.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || medicine.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort medicines
    filtered.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'price':
          compareValue = a.price - b.price;
          break;
        case 'stock':
          compareValue = a.stock - b.stock;
          break;
        default:
          compareValue = 0;
      }
      return sortOrder === 'desc' ? -compareValue : compareValue;
    });

    return filtered;
  }, [searchTerm, selectedCategory, sortBy, sortOrder]);

  return (
    <>
    <Navigation />
    <div className="min-h-screen pt-24 pb-12">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="heading-1 mb-4">Katalog Obat</h1>
          <p className="body-large text-gray-600 max-w-2xl mx-auto">
            Temukan berbagai macam obat, vitamin, dan suplemen kesehatan yang Anda butuhkan. 
            Semua produk dijamin asli dan berkualitas.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari obat, vitamin, atau suplemen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-5 w-5" />
              Filter
            </button>
          </div>

          {/* Filters */}
          <div className={`mt-6 space-y-4 ${showFilters || 'hidden lg:block'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan Berdasarkan</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                  <option value="name">Nama</option>
                  <option value="price">Harga</option>
                  <option value="stock">Stok</option>
                </select>
              </div>
              
              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                  <option value="asc">Ascending (A-Z / Rendah-Tinggi)</option>
                  <option value="desc">Descending (Z-A / Tinggi-Rendah)</option>
                </select>
              </div>
            </div>
            
            {/* Clear Filters */}
            {(searchTerm || selectedCategory !== 'Semua') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Semua');
                  setSortBy('name');
                  setSortOrder('asc');
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
                Hapus Filter
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Menampilkan {filteredMedicines.length} dari {medicines.length} produk
            {searchTerm && (
              <span className="ml-2 text-teal-600 font-medium">
                untuk "{searchTerm}"
              </span>
            )}
          </p>
        </div>

        {/* Medicine Grid */}
        {filteredMedicines.length > 0 ? (
          <div className="medicine-grid">
            {filteredMedicines.map(medicine => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
            <p className="text-gray-600 mb-6">
              Coba ubah kata kunci pencarian atau filter yang Anda gunakan.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Semua');
              }}
              className="btn-primary"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </div>
    </div>
    
    
    </>
  );
};