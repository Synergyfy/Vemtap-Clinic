"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useOpticalInventory } from "@/hooks/useOptician";
import { AlertTriangle } from "lucide-react";

const categoryLabels: Record<string, string> = {
  frame: "Frames",
  lens: "Lenses",
  accessory: "Accessories",
};

export default function InventoryPage() {
  const { data: items = [], isLoading } = useOpticalInventory();
  const [detailItem, setDetailItem] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = items.length;
    const lowStock = items.filter((i) => i.quantityInStock <= 5).length;
    const outOfStock = items.filter((i) => i.quantityInStock === 0).length;
    const totalValue = items.reduce((sum, i) => sum + i.sellingPrice * i.quantityInStock, 0);
    return { total, lowStock, outOfStock, totalValue };
  }, [items]);

  const selectedItem = detailItem ? items.find((i) => i.id === detailItem) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Optical Inventory"
        description="Manage your frames, lenses, and accessories with real-time stock levels."
        actions={[]}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Total Items</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Low Stock</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-amber-600">{stats.lowStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Out of Stock</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Total Value</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">₦{stats.totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-4">
        {items.map((item) => {
          const isLow = item.quantityInStock <= 5;
          return (
            <Card key={item.id} className={isLow ? "border-amber-200 bg-amber-50/30" : ""}>
              <CardHeader className="px-4 py-3 flex-row items-center gap-2 border-b border-slate-100">
                <Badge variant="outline">{categoryLabels[item.category] || item.category}</Badge>
                {isLow && <Badge className="bg-amber-100 text-amber-800">Low Stock</Badge>}
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <button onClick={() => setDetailItem(item.id)} className="font-medium text-slate-900 text-sm hover:text-amber-700 transition-colors truncate text-left">{item.name}</button>
                  <span className="text-[10px] text-slate-400 tabular-nums shrink-0">₦{item.sellingPrice.toLocaleString()}</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">{item.brand}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${item.quantityInStock === 0 ? "text-red-600" : item.quantityInStock <= 5 ? "text-amber-600" : "text-slate-500"}`}>
                    Stock: {item.quantityInStock}
                  </span>
                  <span className="text-[10px] text-slate-400">SKU: {item.sku}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {items.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No inventory items.</p>}
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Cost Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isLow = item.quantityInStock <= 5;
              return (
                <TableRow key={item.id} className={isLow ? "bg-amber-50/50" : ""}>
                  <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                    <button onClick={() => setDetailItem(item.id)} className="hover:text-amber-700 transition-colors text-left">{item.name}</button>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">{categoryLabels[item.category] || item.category}</TableCell>
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">{item.brand}</TableCell>
                  <TableCell className={`text-sm font-medium whitespace-nowrap ${item.quantityInStock === 0 ? "text-red-600" : item.quantityInStock <= 5 ? "text-amber-600" : "text-slate-600"}`}>{item.quantityInStock}</TableCell>
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">₦{item.costPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">₦{item.sellingPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    {item.quantityInStock === 0 ? (
                      <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                    ) : isLow ? (
                      <Badge className="bg-amber-100 text-amber-800">Low Stock</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-slate-500 py-6">No inventory items.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={!!selectedItem} onClose={() => setDetailItem(null)} title="Inventory Item">
        {selectedItem && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedItem.name}</h4>
                <p className="text-sm text-slate-500">{selectedItem.brand} &middot; {selectedItem.model}</p>
                <div className="mt-1"><Badge variant="outline">{categoryLabels[selectedItem.category]}</Badge></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">SKU</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 font-mono">{selectedItem.sku}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Stock</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedItem.quantityInStock}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Cost Price</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">₦{selectedItem.costPrice.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Selling Price</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">₦{selectedItem.sellingPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
