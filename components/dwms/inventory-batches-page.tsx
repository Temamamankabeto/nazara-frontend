'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function InventoryBatchesPage() {
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold">Batch Tracking</h1><p className="text-sm text-muted-foreground">Batch tracking UI for detergent lots, expiry, and traceability.</p></div><Card className="border-amber-200"><CardContent className="pt-6 text-sm text-amber-700">Your current backend ZIP does not include inventory batch tables or batch routes. This page is ready in the sidebar, but backend entities such as product_batches or warehouse_product_batches are required to make it operational.</CardContent></Card><Card><CardHeader><CardTitle>Batch records</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Batch/Lot No.</TableHead><TableHead>Product</TableHead><TableHead>Warehouse</TableHead><TableHead>Expiry Date</TableHead><TableHead className="text-right">Available Qty</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell colSpan={5}>No backend batch endpoint available yet.</TableCell></TableRow></TableBody></Table></CardContent></Card></div>;
}
