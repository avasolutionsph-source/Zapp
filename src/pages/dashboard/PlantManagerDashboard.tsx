// ============================================================
// ZAPP Donuts ERP - Plant Manager Dashboard
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Stat } from '@/components/ui/Stat';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, type TableColumn } from '@/components/ui/Table';
import {
  Truck,
  Store as StoreIcon,
  DollarSign,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { Delivery } from '@/types';

export function PlantManagerDashboard() {
  const [loading, setLoading] = useState(true);

  const currentUser = useStore((s) => s.currentUser);
  const deliveries = useStore((s) => s.deliveries);
  const stores = useStore((s) => s.stores);
  const salesMetrics = useStore((s) => s.salesMetrics);
  const billingRecords = useStore((s) => s.billingRecords);

  const plantId = currentUser?.plantId ?? '';

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // ── Filtered data ───────────────────────────────────────────
  const plantStores = useMemo(() => stores.filter((s) => s.plantId === plantId), [stores, plantId]);
  const plantDeliveries = useMemo(() => deliveries.filter((d) => d.plantId === plantId), [deliveries, plantId]);
  const plantBilling = useMemo(() => billingRecords.filter((b) => b.plantId === plantId), [billingRecords, plantId]);
  const plantSales = useMemo(() => salesMetrics.filter((m) => m.plantId === plantId), [salesMetrics, plantId]);

  // ── KPIs ────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalDeliveries = plantDeliveries.length;
    const storeCount = plantStores.filter((s) => s.status === 'active').length;
    const todayDR = plantDeliveries
      .filter((d) => d.date.slice(0, 10) === new Date().toISOString().slice(0, 10))
      .reduce((sum, d) => sum + d.totalDRCost, 0);
    const pendingBilling = plantBilling.filter((b) => b.status === 'pending' || b.status === 'issued').length;
    return { totalDeliveries, storeCount, todayDR, pendingBilling };
  }, [plantDeliveries, plantStores, plantBilling]);

  // ── Deliveries by Date ──────────────────────────────────────
  const deliveriesByDate = useMemo(() => {
    const byDate = new Map<string, number>();
    plantDeliveries.forEach((d) => {
      byDate.set(d.date, (byDate.get(d.date) ?? 0) + 1);
    });
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
        count,
      }));
  }, [plantDeliveries]);

  // ── Store Performance ───────────────────────────────────────
  const storePerformance = useMemo(() => {
    const storeMap = new Map<string, { srpSales: number; drSales: number }>();
    plantSales.forEach((m) => {
      const entry = storeMap.get(m.storeId) ?? { srpSales: 0, drSales: 0 };
      entry.srpSales += m.srpSales;
      entry.drSales += m.drSales;
      storeMap.set(m.storeId, entry);
    });
    return plantStores
      .map((s) => ({
        id: s.id,
        name: s.name,
        area: s.area,
        status: s.status,
        srpSales: storeMap.get(s.id)?.srpSales ?? 0,
        drSales: storeMap.get(s.id)?.drSales ?? 0,
      }))
      .sort((a, b) => b.srpSales - a.srpSales);
  }, [plantStores, plantSales]);

  const storeColumns: TableColumn<(typeof storePerformance)[0]>[] = [
    { key: 'name', header: 'Store', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'area', header: 'Area' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge category="store" status={row.status} size="sm" /> },
    {
      key: 'srpSales',
      header: 'SRP Sales',
      render: (row) => <span className="font-semibold text-zapp-green">P{row.srpSales.toLocaleString()}</span>,
    },
    {
      key: 'drSales',
      header: 'DR Sales',
      render: (row) => <span>P{row.drSales.toLocaleString()}</span>,
    },
  ];

  // ── Billing Summary ─────────────────────────────────────────
  const billingSummary = useMemo(() => {
    const pending = plantBilling.filter((b) => b.status === 'pending').length;
    const issued = plantBilling.filter((b) => b.status === 'issued').length;
    const paid = plantBilling.filter((b) => b.status === 'paid').length;
    const overdue = plantBilling.filter((b) => b.status === 'overdue').length;
    const totalPayable = plantBilling.reduce((sum, b) => sum + b.totalPayable, 0);
    const totalPaid = plantBilling.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.totalPayable, 0);
    return { pending, issued, paid, overdue, totalPayable, totalPaid };
  }, [plantBilling]);

  const fmt = (n: number) => `P${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
        <Skeleton variant="card" />
        <Skeleton variant="table" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plant Manager Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Operations for your assigned plant
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Truck size={20} />} label="Plant Deliveries" value={kpis.totalDeliveries} />
        <Stat icon={<StoreIcon size={20} />} label="Plant Stores" value={kpis.storeCount} />
        <Stat icon={<DollarSign size={20} />} label="Today's DR Total" value={fmt(kpis.todayDR)} />
        <Stat icon={<FileText size={20} />} label="Pending Billing" value={kpis.pendingBilling} />
      </div>

      {/* Deliveries Chart + Billing Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900">Deliveries (Last 14 Days)</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deliveriesByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#FF6B00" radius={[6, 6, 0, 0]} name="Deliveries" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900">Billing Summary</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-2">
              <p className="text-2xl font-bold text-gray-900">{fmt(billingSummary.totalPayable)}</p>
              <p className="text-xs text-gray-500">Total Payable</p>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Pending', count: billingSummary.pending, cls: 'text-yellow-600 bg-yellow-50' },
                { label: 'Issued', count: billingSummary.issued, cls: 'text-blue-600 bg-blue-50' },
                { label: 'Paid', count: billingSummary.paid, cls: 'text-green-600 bg-green-50' },
                { label: 'Overdue', count: billingSummary.overdue, cls: 'text-red-600 bg-red-50' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${item.cls}`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Collected</span>
                <span className="font-semibold text-green-600">{fmt(billingSummary.totalPaid)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store Performance */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold text-gray-900">Store Performance</h3>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={storeColumns}
            data={storePerformance}
            keyExtractor={(row) => row.id}
            emptyMessage="No stores for this plant."
          />
        </CardContent>
      </Card>
    </div>
  );
}
