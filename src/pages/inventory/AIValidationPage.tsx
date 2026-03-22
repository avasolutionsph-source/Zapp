import { useState, useMemo } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  Card,
  CardHeader,
  CardContent,
  Select,
  Badge,
  Stat,
  Table,
  EmptyState,
} from '@/components/ui';
import type { TableColumn, SelectOption } from '@/components/ui';
import type { AIResult, ConfidenceLevel } from '@/types';

const PAGE_SIZE = 15;

interface AILogEntry {
  id: string;
  date: string;
  storeId: string;
  storeName: string;
  type: AIResult['type'];
  skuId: string;
  skuName: string;
  aiValue: number;
  userFinalValue: number;
  confidence: ConfidenceLevel;
  isMatch: boolean;
  isOverride: boolean;
  imageRef?: string;
  warning?: string;
}

const confidenceBadge = (level: ConfidenceLevel) => {
  const map = {
    high: { variant: 'success' as const, label: 'High' },
    medium: { variant: 'warning' as const, label: 'Medium' },
    low: { variant: 'danger' as const, label: 'Low' },
  };
  const cfg = map[level];
  return <Badge variant={cfg.variant} size="sm" dot>{cfg.label}</Badge>;
};

const typeLabel = (type: AIResult['type']) => {
  const map = { ocr_dr: 'OCR', crate_estimate: 'Crate', discrepancy: 'Discrepancy' };
  return map[type] ?? type;
};

const typeBadge = (type: AIResult['type']) => {
  const map = {
    ocr_dr: 'info' as const,
    crate_estimate: 'orange' as const,
    discrepancy: 'warning' as const,
  };
  return <Badge variant={map[type] ?? 'neutral'} size="sm">{typeLabel(type)}</Badge>;
};

export default function AIValidationPage() {
  const {
    beginningInventories,
    endingInventories,
    stores,
  } = useStore();

  // Build AI log entries from inventories
  const allEntries = useMemo(() => {
    const entries: AILogEntry[] = [];

    beginningInventories.forEach((bi) => {
      const store = stores.find((s) => s.id === bi.storeId);
      bi.aiResults.forEach((ai) => {
        const confirmed = bi.confirmedItems.find((c) => c.skuId === ai.skuId);
        const aiVal = ai.extractedValue ?? ai.estimatedValue ?? 0;
        const userVal = confirmed?.quantity ?? aiVal;
        entries.push({
          id: ai.id,
          date: bi.date,
          storeId: bi.storeId,
          storeName: store?.name ?? bi.storeId,
          type: ai.type,
          skuId: ai.skuId ?? '',
          skuName: ai.skuName ?? '-',
          aiValue: aiVal,
          userFinalValue: userVal,
          confidence: ai.confidence,
          isMatch: aiVal === userVal,
          isOverride: confirmed?.manualOverride ?? false,
          imageRef: ai.imageRef,
          warning: ai.warning,
        });
      });
    });

    endingInventories.forEach((ei) => {
      const store = stores.find((s) => s.id === ei.storeId);
      ei.aiResults.forEach((ai) => {
        const unsold = ei.unsoldItems.find((u) => u.skuId === ai.skuId);
        const aiVal = ai.extractedValue ?? ai.estimatedValue ?? 0;
        const userVal = unsold?.quantity ?? aiVal;
        entries.push({
          id: ai.id,
          date: ei.date,
          storeId: ei.storeId,
          storeName: store?.name ?? ei.storeId,
          type: ai.type,
          skuId: ai.skuId ?? '',
          skuName: ai.skuName ?? '-',
          aiValue: aiVal,
          userFinalValue: userVal,
          confidence: ai.confidence,
          isMatch: aiVal === userVal,
          isOverride: unsold?.manualOverride ?? false,
          imageRef: ai.imageRef,
          warning: ai.warning,
        });
      });
    });

    entries.sort((a, b) => b.date.localeCompare(a.date));
    return entries;
  }, [beginningInventories, endingInventories, stores]);

  const [confidenceFilter, setConfidenceFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => {
    const total = allEntries.length;
    const highConf = allEntries.filter((e) => e.confidence === 'high').length;
    const overrides = allEntries.filter((e) => e.isOverride).length;
    const discrepancies = allEntries.filter((e) => !e.isMatch).length;
    return {
      total,
      highConfPct: total > 0 ? ((highConf / total) * 100).toFixed(1) : '0',
      overrides,
      discrepancyRate: total > 0 ? ((discrepancies / total) * 100).toFixed(1) : '0',
    };
  }, [allEntries]);

  // Unique stores for filter
  const storeOptions: SelectOption[] = useMemo(() => {
    const unique = [...new Set(allEntries.map((e) => e.storeId))];
    return [
      { value: '', label: 'All Stores' },
      ...unique.map((id) => ({
        value: id,
        label: allEntries.find((e) => e.storeId === id)?.storeName ?? id,
      })),
    ];
  }, [allEntries]);

  const confidenceOptions: SelectOption[] = [
    { value: '', label: 'All Confidence' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const typeOptions: SelectOption[] = [
    { value: '', label: 'All Types' },
    { value: 'ocr_dr', label: 'OCR' },
    { value: 'crate_estimate', label: 'Crate' },
    { value: 'discrepancy', label: 'Discrepancy' },
  ];

  const filtered = useMemo(() => {
    let result = [...allEntries];
    if (confidenceFilter) result = result.filter((e) => e.confidence === confidenceFilter);
    if (typeFilter) result = result.filter((e) => e.type === typeFilter);
    if (storeFilter) result = result.filter((e) => e.storeId === storeFilter);
    if (dateFilter) result = result.filter((e) => e.date === dateFilter);
    return result;
  }, [allEntries, confidenceFilter, typeFilter, storeFilter, dateFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const columns: TableColumn<AILogEntry>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'storeName',
      header: 'Store',
      render: (row) => row.storeName,
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => typeBadge(row.type),
    },
    {
      key: 'skuName',
      header: 'SKU',
      render: (row) => row.skuName,
    },
    {
      key: 'aiValue',
      header: 'AI Value',
      render: (row) => row.aiValue,
    },
    {
      key: 'userFinalValue',
      header: 'User Final',
      render: (row) => row.userFinalValue,
    },
    {
      key: 'confidence',
      header: 'Confidence',
      render: (row) => confidenceBadge(row.confidence),
    },
    {
      key: 'isMatch',
      header: 'Match',
      render: (row) =>
        row.isMatch ? (
          <CheckCircle2 size={16} className="text-green-500" />
        ) : (
          <AlertTriangle size={16} className="text-amber-500" />
        ),
    },
    {
      key: 'expand',
      header: '',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpandedId(expandedId === row.id ? null : row.id);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          {expandedId === row.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      ),
    },
  ];

  if (allEntries.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Validation Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Review all AI processing events and results</p>
        </div>
        <EmptyState
          icon={<Cpu size={28} />}
          title="No AI Processing Events"
          description="AI validation logs will appear here once beginning or ending inventories have been processed."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Validation Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Review all AI processing events and results</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Cpu size={18} />} label="Total Processed" value={stats.total} />
        <Stat icon={<CheckCircle2 size={18} />} label="High Confidence %" value={`${stats.highConfPct}%`} />
        <Stat icon={<BarChart3 size={18} />} label="Manual Overrides" value={stats.overrides} />
        <Stat icon={<AlertTriangle size={18} />} label="Discrepancy Rate" value={`${stats.discrepancyRate}%`} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select options={confidenceOptions} value={confidenceFilter} onChange={(e) => { setConfidenceFilter(e.target.value); setPage(1); }} />
            <Select options={typeOptions} value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} />
            <Select options={storeOptions} value={storeFilter} onChange={(e) => { setStoreFilter(e.target.value); setPage(1); }} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-zapp-orange/30 focus:border-zapp-orange"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={paged}
        keyExtractor={(row) => row.id}
        emptyMessage="No AI events matching your filters."
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total: filtered.length,
          onPageChange: setPage,
        }}
      />

      {/* Expanded Detail */}
      {expandedId && (() => {
        const entry = allEntries.find((e) => e.id === expandedId);
        if (!entry) return null;
        return (
          <Card className="border-zapp-orange/30">
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">
                AI Result Detail - {entry.skuName}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">{typeLabel(entry.type)}</p>
                </div>
                <div>
                  <p className="text-gray-500">AI Value</p>
                  <p className="font-medium">{entry.aiValue}</p>
                </div>
                <div>
                  <p className="text-gray-500">User Final Value</p>
                  <p className="font-medium">{entry.userFinalValue}</p>
                </div>
                <div>
                  <p className="text-gray-500">Confidence</p>
                  {confidenceBadge(entry.confidence)}
                </div>
                <div>
                  <p className="text-gray-500">Match</p>
                  <p className={`font-medium ${entry.isMatch ? 'text-green-600' : 'text-amber-600'}`}>
                    {entry.isMatch ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Manual Override</p>
                  <p className="font-medium">
                    {entry.isOverride ? (
                      <Badge variant="warning" size="sm">Yes</Badge>
                    ) : 'No'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Warning</p>
                  <p className="text-sm text-amber-700">{entry.warning ?? 'None'}</p>
                </div>
              </div>
              {entry.imageRef && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <ImageIcon size={14} />
                  <span>Image reference: {entry.imageRef}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
