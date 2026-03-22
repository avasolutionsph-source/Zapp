import { useState, useMemo } from 'react';
import {
  Truck,
  Package,
  Eye,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  Card,
  CardContent,
  Select,
  Table,
  Tabs,
  StatusBadge,
  Stat,
} from '@/components/ui';
import type { TableColumn, SelectOption, Tab } from '@/components/ui';
import type { Delivery } from '@/types';
import DeliveryDetailDrawer from './DeliveryDetailDrawer';

const PAGE_SIZE = 10;

const statusTabs: Tab[] = [
  { key: 'all', label: 'All' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'reconciled', label: 'Reconciled' },
];

export default function DeliveriesPage() {
  const {
    getDeliveriesForCurrentUser,
    stores,
    plants,
  } = useStore();

  const allDeliveries = getDeliveriesForCurrentUser();

  const [activeTab, setActiveTab] = useState('all');
  const [plantFilter, setPlantFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  const storeName = (id: string) => stores.find((s) => s.id === id)?.name ?? '-';
  const plantName = (id: string) => plants.find((p) => p.id === id)?.name ?? '-';

  const filtered = useMemo(() => {
    let result = [...allDeliveries];
    if (activeTab !== 'all') result = result.filter((d) => d.status === activeTab);
    if (plantFilter) result = result.filter((d) => d.plantId === plantFilter);
    if (storeFilter) result = result.filter((d) => d.storeId === storeFilter);
    if (dateFrom) result = result.filter((d) => d.date >= dateFrom);
    if (dateTo) result = result.filter((d) => d.date <= dateTo);
    result.sort((a, b) => b.date.localeCompare(a.date));
    return result;
  }, [allDeliveries, activeTab, plantFilter, storeFilter, dateFrom, dateTo]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Stats
  const counts = useMemo(() => ({
    total: allDeliveries.length,
    scheduled: allDeliveries.filter((d) => d.status === 'scheduled').length,
    in_transit: allDeliveries.filter((d) => d.status === 'in_transit').length,
    delivered: allDeliveries.filter((d) => d.status === 'delivered').length,
  }), [allDeliveries]);

  const plantOptions: SelectOption[] = [
    { value: '', label: 'All Plants' },
    ...plants.map((p) => ({ value: p.id, label: p.name })),
  ];

  const storeOptions: SelectOption[] = [
    { value: '', label: 'All Stores' },
    ...stores.map((s) => ({ value: s.id, label: s.name })),
  ];

  const columns: TableColumn<Delivery>[] = [
    {
      key: 'drNumber',
      header: 'DR Number',
      sortable: true,
      render: (row) => <span className="font-mono text-sm font-medium text-gray-900">{row.drNumber}</span>,
    },
    {
      key: 'storeId',
      header: 'Store',
      render: (row) => storeName(row.storeId),
    },
    {
      key: 'plantId',
      header: 'Plant',
      render: (row) => plantName(row.plantId),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge category="delivery" status={row.status} />,
    },
    {
      key: 'items',
      header: 'Items',
      render: (row) => row.items.length,
    },
    {
      key: 'totalDRCost',
      header: 'DR Total',
      render: (row) => `P${row.totalDRCost.toLocaleString()}`,
    },
    {
      key: 'totalSRP',
      header: 'SRP Total',
      render: (row) => `P${row.totalSRP.toLocaleString()}`,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDelivery(row);
          }}
          className="inline-flex items-center gap-1 text-sm text-zapp-orange hover:text-zapp-orange-dark transition-colors"
        >
          <Eye size={14} /> View
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage all store deliveries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Truck size={18} />} label="Total Deliveries" value={counts.total} />
        <Stat icon={<Package size={18} />} label="Scheduled" value={counts.scheduled} />
        <Stat icon={<Truck size={18} />} label="In Transit" value={counts.in_transit} />
        <Stat icon={<Package size={18} />} label="Delivered" value={counts.delivered} />
      </div>

      {/* Status Tabs */}
      <Tabs
        tabs={statusTabs}
        activeTab={activeTab}
        onChange={(key) => { setActiveTab(key); setPage(1); }}
      >
        {/* Filters */}
        <Card className="mb-4">
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select options={plantOptions} value={plantFilter} onChange={(e) => { setPlantFilter(e.target.value); setPage(1); }} />
              <Select options={storeOptions} value={storeFilter} onChange={(e) => { setStoreFilter(e.target.value); setPage(1); }} />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-zapp-orange/30 focus:border-zapp-orange"
                placeholder="From Date"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-zapp-orange/30 focus:border-zapp-orange"
                placeholder="To Date"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Table
          columns={columns}
          data={paged}
          keyExtractor={(row) => row.id}
          emptyMessage="No deliveries found matching your filters."
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total: filtered.length,
            onPageChange: setPage,
          }}
        />
      </Tabs>

      {/* Delivery Detail Drawer */}
      <DeliveryDetailDrawer
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
      />
    </div>
  );
}
