
import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, Trash2, Edit, Package } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "../Layouts/DashboardLayout";

const MedicineStock = () => {
  const { props } = usePage();
  const { medicine, batches } = props;

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showIssue, setShowIssue] = useState(false);

  const [form, setForm] = useState({ batchCode:"", qty:"", expirationDate:"", receivedAt:"", note:"" });
  const [issueQty, setIssueQty] = useState(1);

  const resetForm = () => setForm({ batchCode:"", qty:"", expirationDate:"", receivedAt:"", note:"" });

  const addBatch = () => {
    router.post(route('batches.store', medicine.id), form, {
      preserveScroll: true,
      onSuccess: () => { setShowAdd(false); resetForm(); toast.success('Batch added'); },
      onError: (e) => Object.values(e).forEach(err => toast.error(err))
    });
  };

  const updateBatch = () => {
    if (!editing) return;
    router.put(route('batches.update', [medicine.id, editing.id]), form, {
      preserveScroll: true,
      onSuccess: () => { setShowEdit(false); setEditing(null); resetForm(); toast.success('Batch updated'); },
      onError: (e) => Object.values(e).forEach(err => toast.error(err))
    });
  };

  const deleteBatch = (batch) => {
    if (!confirm('Delete this batch? Remaining qty must be 0.')) return;
    router.delete(route('batches.destroy', [medicine.id, batch.id]), {
      preserveScroll: true,
      onSuccess: () => toast.success('Batch deleted'),
      onError: () => toast.error('Failed to delete batch')
    });
  };

  const issueStock = () => {
    router.post(route('stock.issue', medicine.id), { qty: issueQty }, {
      preserveScroll: true,
      onSuccess: () => { setShowIssue(false); setIssueQty(1); toast.success('Issued by FEFO'); },
      onError: (e) => Object.values(e).forEach(err => toast.error(err))
    });
  };

  const statusBadge = () => {
    const nearest = medicine.nearestExpiry ? new Date(medicine.nearestExpiry) : null;
    const today = new Date();
    let label = 'Available', cls = 'bg-green-100 text-green-800';
    if (nearest && nearest < today) { label = 'Expired'; cls = 'bg-red-100 text-red-800'; }
    else if (nearest && (nearest - today) / (1000*60*60*24) <= 30) { label = 'Expiring Soon'; cls = 'bg-orange-100 text-orange-800'; }
    else if (medicine.totalStock <= medicine.minStock) { label = 'Low Stock'; cls = 'bg-yellow-100 text-yellow-800'; }
    return <Badge className={cls}>{label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Stock — {medicine.name}</h1>
            <p className="text-sm text-gray-600">Category: {medicine.category} • Unit: {medicine.unit}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showIssue} onOpenChange={setShowIssue}>
              <DialogTrigger asChild>
                <Button variant="outline">Issue (FEFO)</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Issue Stock (FEFO)</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Label>Total available: {medicine.totalStock} {medicine.unit}{medicine.totalStock>1?'s':''}</Label>
                  <Input type="number" min={1} value={issueQty} onChange={e=>setIssueQty(parseInt(e.target.value||'0',10))} />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={()=>setShowIssue(false)}>Cancel</Button>
                    <Button onClick={issueStock}>Issue</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700"><Plus className="w-4 h-4 mr-1"/>Add Batch</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Batch</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Batch Code</Label>
                    <Input value={form.batchCode} onChange={e=>setForm({...form, batchCode:e.target.value})} placeholder="Optional or auto"/>
                  </div>
                  <div>
                    <Label>Quantity *</Label>
                    <Input type="number" value={form.qty} onChange={e=>setForm({...form, qty:e.target.value})} />
                  </div>
                  <div>
                    <Label>Expiration Date *</Label>
                    <Input type="date" value={form.expirationDate} onChange={e=>setForm({...form, expirationDate:e.target.value})} />
                  </div>

                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={()=>{setShowAdd(false); resetForm();}}>Cancel</Button>
                  <Button onClick={addBatch}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-600"/>
              <span className="text-sm text-gray-700">Total Stock:</span>
              <span className="font-semibold">{medicine.totalStock} {medicine.unit}{medicine.totalStock>1?'s':''}</span>
            </div>
            {statusBadge()}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batches.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-6 text-center text-gray-500">No batches yet</td>
                  </tr>
                )}
                {batches.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{b.batchCode}</td>
                    <td className="px-4 py-2">{b.qty}</td>
                    <td className="px-4 py-2">{new Date(b.expirationDate).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditing(b); setForm({ batchCode:b.batchCode||'', qty:String(b.qty), expirationDate:b.expirationDate||'', receivedAt:b.receivedAt||'', note:b.note||'' }); setShowEdit(true); }}
                          className="text-teal-600 hover:text-teal-700"
                        >
                          <Edit className="w-4 h-4"/>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBatch(b)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4"/>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Edit dialog */}
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit Batch</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Batch Code</Label>
                <Input value={form.batchCode} onChange={e=>setForm({...form, batchCode:e.target.value})}/>
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input type="number" value={form.qty} onChange={e=>setForm({...form, qty:e.target.value})}/>
              </div>
              <div>
                <Label>Expiration Date *</Label>
                <Input type="date" value={form.expirationDate} onChange={e=>setForm({...form, expirationDate:e.target.value})}/>
              </div>

            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={()=>{ setShowEdit(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={updateBatch}>Update</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MedicineStock;
