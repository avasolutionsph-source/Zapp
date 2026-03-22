// ============================================================
// ZAPP Donuts ERP - Billing Dashboard
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Stat } from '@/components/ui/Stat';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, type TableColumn } from '@/components/ui/Table';
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { BillingRecord, Payment } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#EAB308',
  issued: '#3B82F6',
  paid: '#22C55E',
  overdue: '#EF4444',
};

export function BillingDashboard() {
  const [loading, setLoading] = useState(true);

  const currentUser = useStore((s) => s.currentUser);
  const billingRecords = useStore((s) => s.billingRecords);
  const payments = useStore((s) => s.payments);
  const stores = useStore((s) => s.stores);

  const plantId = currentUser?.plantId ?? '';

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // ── Filtered data ───────────────────────────────────────────
  const myBilling = useMemo(() => billingRecords.filter((b) => b.plantId === plantId), [billingRecords, plantId]);
  const myPayments = useMemo(() => {
    const billingIds = new Set(myBilling.map((b) => b.id));
    return payments.filter((p) => billingIds.has(p.billingId));
  }, [payments, myBilling]);

  // ── KPIs ────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalPayable = myBilling.reduce((sum, b) => sum + b.totalPayable, 0);
    const paidAmount = myBilling
      .filter((b) => b.status === 'paid')
      .reduce((sum, b) => sum + b.totalPayable, 0);
    const overdueCount = myBilling.filter((b) => b.status === 'overdue').length;
    const pendingPayments = myPayments.filter((p) => p.status === 'submitted').length;
    return { totalPayable, paidAmount, overdueCount, pendingPayments };
  }, [myBilling, myPayments]);

  // ── Billing Status Breakdown ────────────────────────────────
  const statusBreakdown = useMemo(() => {
    const counts = { pending: 0, issued: 0, paid: 0, overdue: 0 };
    myBilling.forEach((b) => {
      if (b.status in counts) counts[b.status as keyof typeof counts]++;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: STATUS_COLORS[name],
    }));
  }, [myBilling]);

  // ── Recent Payments ─────────────────────────────────────────
  const recentPayments = useMemo(
    () =>
      [...myPayments]
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 10),
    [myPayments],
  );

  const storeMap = useMemo(() => new Map(stores.map((s) => [s.id, s.name])), [stores]);

  const paymentColumns: TableColumn<Payment>[] = [
    {
      key: 'referenceNumber',
      header: 'Reference #',
      render: (row) => <span className="font-mono text-sm">{row.referenceNumber}</span>,
    },
    {
      key: 'storeId',
      header: 'Store',
      render: (row) => <span className="font-medium">{storeMap.get(row.storeId) ?? row.storeId}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => <span className="font-semibold">P{row.amount.toLocaleString()}</span>,
    },
    {
      key: 'datePaid',
      header: 'Date Paid',
      render: (row) =>
        new Date(row.datePaid).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      key: 'method',
      header: 'Method',
      render: (row) => <span className="capitalize">{row.method}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge category="payment" status={row.status} size="sm" />,
    },
  ];

  // ── Overdue Accounts ────────────────────────────────────────
  const overdueAccounts = useMemo(
    () =>
      myBilling
        .filter((b) => b.status === 'overdue')
        .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
    [myBilling],
  );

  const overdueColumns: TableColumn<BillingRecord>[] = [
    {
      key: 'storeId',
      header: 'Store',
      render: (row) => <span className="font-medium">{storeMap.get(row.storeId) ?? row.storeId}</span>,
    },
    {
      key: 'period',
      header: 'Period',
      render: (row) => <span>{row.period}</span>,
    },
    {
      key: 'totalPayable',
      header: 'Amount Due',
      render: (row) => <span className="font-semibold text-red-600">P{row.totalPayable.toLocaleString()}</span>,
    },
    {
      key: 'dueAt',
      header: 'Due Date',
      render: (row) =>
        new Date(row.dueAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      key: 'daysPast',
      header: 'Days Past',
      render: (row) => {
        const days = Math.floor((Date.now() - new Date(row.dueAt).getTime()) / 86400000);
        return <span className="font-bold text-red-600">{days > 0 ? `${days}d` : '--'}</span>;
      },
    },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Billing Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Billing records and payment tracking</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<DollarSign size={20} />} label="Total Payable" value={fmt(kpis.totalPayable)} />
        <Stat icon={<CheckCircle size={20} />} label="Paid Amount" value={fmt(kpis.paidAmount)} change={4.2} />
        <Stat icon={<AlertCircle size={20} />} label="Overdue Count" value={kpis.overdueCount} />
        <Stat icon={<Clock size={20} />} label="Pending Payments" value={kpis.pendingPayments} />
      </div>

      {/* Billing Status Pie + Payment Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900">Billing Status Breakdown</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusBreakdown.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900">Recent Payments</h3>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              columns={paymentColumns}
              data={recentPayments}
              keyExtractor={(row) => row.id}
              emptyMessage="No payments yet."
            />
          </CardContent>
        </Card>
      </div>

      {/* Overdue Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" />
            <h3 className="text-base font-semibold text-gray-900">Overdue Accounts</h3>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={overdueColumns}
            data={overdueAccounts}
            keyExtractor={(row) => row.id}
            emptyMessage="No overdue accounts."
          />
        </CardContent>
      </Card>
    </div>
  );
}
