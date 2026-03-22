// ============================================================
// ZAPP Donuts ERP - Public Store Directory Page
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Grid3X3,
  List,
  Store as StoreIcon,
  Phone,
  Mail,
  Donut,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Building2,
  User,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  SearchInput,
  Select,
  Modal,
  Badge,
  StatusBadge,
  EmptyState,
} from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { useStore } from '@/store/useStore';
import type { Store } from '@/types';

// ── Constants ─────────────────────────────────────────────────

const ITEMS_PER_PAGE = 12;

const FRANCHISE_TYPE_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Types' },
  { value: 'distributor', label: 'Distributor-Linked' },
  { value: 'direct', label: 'Direct to ZAPP' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
];

// ── Store Directory Page ──────────────────────────────────────

export default function StoreDirectoryPage() {
  const navigate = useNavigate();
  const { stores, plants, distributors, areaManagers } = useStore();

  // Filters
  const [search, setSearch] = useState('');
  const [plantFilter, setPlantFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // View
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  // Detail modal
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // ── Derived options ────────────────────────────────────────

  const plantOptions: SelectOption[] = useMemo(
    () => [{ value: '', label: 'All Plants' }, ...plants.map((p) => ({ value: p.id, label: p.name }))],
    [plants],
  );

  const allAreas = useMemo(() => {
    const areas = [...new Set(stores.map((s) => s.area).filter(Boolean))].sort();
    return [{ value: '', label: 'All Areas' }, ...areas.map((a) => ({ value: a, label: a }))];
  }, [stores]);

  const allProvinces = useMemo(() => {
    const provinces = [...new Set(stores.map((s) => s.province).filter(Boolean))].sort();
    return [{ value: '', label: 'All Provinces' }, ...provinces.map((p) => ({ value: p, label: p }))];
  }, [stores]);

  // ── Filtered stores ────────────────────────────────────────

  const filteredStores = useMemo(() => {
    let result = stores.filter((s) => s.status === 'active' || s.status === 'pending');

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.ownerName.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.province.toLowerCase().includes(q),
      );
    }

    if (plantFilter) result = result.filter((s) => s.plantId === plantFilter);
    if (areaFilter) result = result.filter((s) => s.area === areaFilter);
    if (provinceFilter) result = result.filter((s) => s.province === provinceFilter);
    if (typeFilter) result = result.filter((s) => s.franchiseType === typeFilter);
    if (statusFilter) result = result.filter((s) => s.status === statusFilter);

    return result;
  }, [stores, search, plantFilter, areaFilter, provinceFilter, typeFilter, statusFilter]);

  // ── Pagination ─────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedStores = filteredStores.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Helpers ────────────────────────────────────────────────

  const getPlantName = (plantId: string) => plants.find((p) => p.id === plantId)?.name ?? plantId;
  const getDistributorName = (distId?: string) =>
    distId ? distributors.find((d) => d.id === distId)?.name ?? '' : 'N/A (Direct)';
  const getAreaManagerName = (amId: string) =>
    areaManagers.find((a) => a.id === amId)?.name ?? '';

  // Reset page when filters change
  const handleFilterChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-zapp-orange transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zapp-orange">
              <Donut size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ZAPP Donuts Store Directory</h1>
              <p className="text-sm text-gray-500">
                Browse our franchise stores across the Philippines. {filteredStores.length} stores found.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Search & Filters ────────────────────────────── */}
        <div className="mb-6 space-y-4">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search stores by name, owner, address, area..."
            className="max-w-xl"
          />

          <div className="flex flex-wrap items-end gap-3">
            <Select
              label="Plant"
              options={plantOptions}
              value={plantFilter}
              onChange={handleFilterChange(setPlantFilter)}
              className="w-44"
            />
            <Select
              label="Area"
              options={allAreas}
              value={areaFilter}
              onChange={handleFilterChange(setAreaFilter)}
              className="w-44"
            />
            <Select
              label="Province"
              options={allProvinces}
              value={provinceFilter}
              onChange={handleFilterChange(setProvinceFilter)}
              className="w-44"
            />
            <Select
              label="Franchise Type"
              options={FRANCHISE_TYPE_OPTIONS}
              value={typeFilter}
              onChange={handleFilterChange(setTypeFilter)}
              className="w-48"
            />
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              className="w-36"
            />

            {/* View toggle */}
            <div className="ml-auto flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === 'grid' ? 'bg-zapp-orange text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === 'list' ? 'bg-zapp-orange text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Content ─────────────────────────────────────── */}
        {filteredStores.length === 0 ? (
          <Card>
            <EmptyState
              icon={<StoreIcon size={28} />}
              title="No stores found"
              description="Try adjusting your search or filter criteria."
            />
          </Card>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pagedStores.map((store) => (
              <Card
                key={store.id}
                hover
                className="cursor-pointer transition-all hover:border-orange-200"
                onClick={() => setSelectedStore(store)}
              >
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                      <StoreIcon size={18} className="text-zapp-orange" />
                    </div>
                    <StatusBadge category="store" status={store.status} size="sm" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{store.name}</h3>
                    <p className="mt-0.5 text-xs text-gray-500">{store.ownerName}</p>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-gray-500">
                    <MapPin size={12} className="mt-0.5 shrink-0 text-gray-400" />
                    <span className="line-clamp-2">{store.address}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="orange" size="sm">
                      {store.franchiseType === 'distributor' ? 'Distributor' : 'Direct'}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {store.area}
                    </Badge>
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{store.province}</span>
                      <span>{getPlantName(store.plantId)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Store
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Owner
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Area
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Province
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Plant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedStores.map((store) => (
                    <tr
                      key={store.id}
                      className="cursor-pointer hover:bg-orange-50/30 transition-colors"
                      onClick={() => setSelectedStore(store)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                            <StoreIcon size={14} className="text-zapp-orange" />
                          </div>
                          <span className="font-medium text-gray-900">{store.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{store.ownerName}</td>
                      <td className="px-4 py-3 text-gray-600">{store.area}</td>
                      <td className="px-4 py-3 text-gray-600">{store.province}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{getPlantName(store.plantId)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="orange" size="sm">
                          {store.franchiseType === 'distributor' ? 'Distributor' : 'Direct'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge category="store" status={store.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ─── Pagination ──────────────────────────────────── */}
        {filteredStores.length > ITEMS_PER_PAGE && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}
              &ndash;
              {Math.min(safePage * ITEMS_PER_PAGE, filteredStores.length)} of {filteredStores.length} stores
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => handlePageChange(safePage - 1)}
                iconLeft={<ChevronLeft size={14} />}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`e-${idx}`} className="px-1 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => handlePageChange(item as number)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        item === safePage
                          ? 'bg-zapp-orange text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => handlePageChange(safePage + 1)}
                iconRight={<ChevronRight size={14} />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Store Detail Modal ───────────────────────────── */}
      <Modal
        open={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        title={selectedStore?.name ?? 'Store Details'}
        size="lg"
      >
        {selectedStore && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                <StoreIcon size={24} className="text-zapp-orange" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{selectedStore.name}</h3>
                <p className="text-sm text-gray-500">{selectedStore.businessName}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge category="store" status={selectedStore.status} />
                  <Badge variant="orange">
                    {selectedStore.franchiseType === 'distributor' ? 'Distributor-Linked' : 'Direct to ZAPP'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <User size={12} />
                  Owner
                </div>
                <p className="mt-1 text-sm font-medium text-gray-900">{selectedStore.ownerName}</p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <Building2 size={12} />
                  Plant
                </div>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {getPlantName(selectedStore.plantId)}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <MapPin size={12} />
                  Address
                </div>
                <p className="mt-1 text-sm text-gray-900">{selectedStore.address}</p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <Navigation size={12} />
                  Area / Province
                </div>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedStore.area}, {selectedStore.province}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <Phone size={12} />
                  Phone
                </div>
                <p className="mt-1 text-sm text-gray-900">{selectedStore.phone || 'N/A'}</p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <Mail size={12} />
                  Email
                </div>
                <p className="mt-1 text-sm text-gray-900">{selectedStore.email || 'N/A'}</p>
              </div>
            </div>

            {/* Distributor / Area Manager */}
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedStore.distributorId && (
                <div className="rounded-lg border border-orange-100 bg-orange-50/50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                    Distributor
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {getDistributorName(selectedStore.distributorId)}
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Area Manager
                </div>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {getAreaManagerName(selectedStore.areaManagerId) || 'Not assigned'}
                </p>
              </div>
            </div>

            {/* Map placeholder with coordinates */}
            <div className="rounded-lg border border-gray-200 bg-gray-100 p-6">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <MapPin size={32} className="text-gray-400" />
                <p className="text-sm font-medium text-gray-600">Store Location</p>
                <p className="text-xs text-gray-400">
                  Latitude: {selectedStore.lat.toFixed(6)} &middot; Longitude:{' '}
                  {selectedStore.lng.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${selectedStore.lat},${selectedStore.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-zapp-orange hover:underline"
                >
                  Open in Google Maps
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>

            {/* Member since */}
            <div className="text-center text-xs text-gray-400">
              Member since{' '}
              {new Date(selectedStore.createdAt).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
