import React, { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import DashboardLayout from "../Layouts/DashboardLayout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Search, AlertTriangle, Clock, Ban, Package } from "lucide-react";

const StatusPill = ({ stock, minStock, nearestExpiry }) => {
  const today = new Date();
  const ne = nearestExpiry ? new Date(nearestExpiry) : null;
  if (ne && ne < today) return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
  if (ne && (ne - today) / (1000*60*60*24) <= 30) return <Badge className="bg-orange-100 text-orange-800">Expiring Soon</Badge>;
  if (stock <= minStock) return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
  return <Badge className="bg-green-100 text-green-800">OK</Badge>;
};

export default function AlertMedicines() {
  const { props } = usePage();
  const { medicines, filters, categories, summary, pagination } = props;

  const [status, setStatus] = useState(filters.status || 'low-stock');
  const [search, setSearch] = useState(filters.search || '');
  const [category, setCategory] = useState(filters.category || 'all');

  useEffect(() => {
    const t = setTimeout(() => {
      router.get(route('medicines.alerts'), { status, search, category }, { preserveState: true, replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [status, search, category]);

  const goStock = (id) => router.get(route('medicines.stock', id));

  const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID') : '-';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Medicine Alerts</h1>
            <p className="text-sm text-gray-600">Lihat daftar obat yang <strong>Low Stock</strong>, <strong>Expiring Soon</strong>, dan <strong>Expired</strong>.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <div className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-yellow-600"/> {summary.lowStock} Low Stock</div>
            <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-orange-600"/> {summary.expiring} Expiring</div>
            <div className="flex items-center gap-1"><Ban className="w-4 h-4 text-red-600"/> {summary.expired} Expired</div>
          </div>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <Input value={search} onChange={e=>setSearch(e.target.value)} className="pl-9" placeholder="Search by name/category"/>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="All Categories"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Package className="w-4 h-4 mr-1"/> {medicines.length} shown
            </div>
          </div>
        </Card>

        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nearest Expiry</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicines.length === 0 && (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">No data</td></tr>
              )}
              {medicines.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{m.name}</td>
                  <td className="px-4 py-2 text-gray-700">{m.category}</td>
                  <td className="px-4 py-2">{m.stock} {m.unit}{m.stock>1?'s':''}</td>
                  <td className="px-4 py-2">{m.minStock}</td>
                  <td className="px-4 py-2">{fmt(m.nearestExpiry)}</td>
                  <td className="px-4 py-2"><StatusPill stock={m.stock} minStock={m.minStock} nearestExpiry={m.nearestExpiry}/></td>
                  <td className="px-4 py-2">
                    <Button variant="outline" size="sm" onClick={() => goStock(m.id)}>View Stock</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Simple pagination */}
        {pagination && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>Page {pagination.current_page} of {pagination.last_page}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={pagination.current_page <= 1}
                onClick={() => router.get(route('medicines.alerts'), { status, search, category, page: pagination.current_page - 1 }, { preserveState: true, replace: true })}
              >Prev</Button>
              <Button variant="outline" size="sm" disabled={pagination.current_page >= pagination.last_page}
                onClick={() => router.get(route('medicines.alerts'), { status, search, category, page: pagination.current_page + 1 }, { preserveState: true, replace: true })}
              >Next</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
