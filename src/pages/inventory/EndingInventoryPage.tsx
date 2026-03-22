import { useState, useMemo, useCallback } from 'react';
import {
  ClipboardCheck,
  Camera,
  Cpu,
  Save,
  AlertTriangle,
  CheckSquare,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { aiService } from '@/services/api';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Select,
  Badge,
  FileUpload,
  ConfirmDialog,
  EmptyState,
} from '@/components/ui';
import type { SelectOption, UploadedFile } from '@/components/ui';
import type { AIResult, InventoryItem } from '@/types';

interface UnsoldRow {
  skuId: string;
  skuName: string;
  deliveredQty: number;
  unsoldQty: number;
  soldQty: number;
  aiEstimate: number | null;
  aiConfidence: AIResult['confidence'] | null;
  useAI: boolean;
  hasDiscrepancy: boolean;
}

const confidenceBadge = (level: AIResult['confidence'] | null) => {
  if (!level) return null;
  const map = {
    high: { variant: 'success' as const, label: 'High' },
    medium: { variant: 'warning' as const, label: 'Medium' },
    low: { variant: 'danger' as const, label: 'Low' },
  };
  const cfg = map[level];
  return <Badge variant={cfg.variant} size="sm" dot>{cfg.label}</Badge>;
};

export default function EndingInventoryPage() {
  const {
    deliveries,
    stores,
    addEndingInventory,
  } = useStore();

  // Deliveries that have been delivered (or have beginning inventory)
  const eligibleDeliveries = useMemo(
    () => deliveries.filter((d) => d.status === 'delivered' || d.status === 'reconciled'),
    [deliveries],
  );

  const [selectedDeliveryId, setSelectedDeliveryId] = useState('');
  const [unsoldRows, setUnsoldRows] = useState<UnsoldRow[]>([]);
  const [crateFiles, setCrateFiles] = useState<UploadedFile[]>([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [notes, setNotes] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const delivery = eligibleDeliveries.find((d) => d.id === selectedDeliveryId);
  const store = delivery ? stores.find((s) => s.id === delivery.storeId) : null;

  const deliveryOptions: SelectOption[] = [
    { value: '', label: 'Select a delivery...' },
    ...eligibleDeliveries.map((d) => ({
      value: d.id,
      label: `${d.drNumber} - ${stores.find((s) => s.id === d.storeId)?.name ?? d.storeId} (${d.date})`,
    })),
  ];

  // Initialize rows when delivery selected
  const handleDeliveryChange = (id: string) => {
    setSelectedDeliveryId(id);
    setAiDone(false);
    setCrateFiles([]);
    const del = eligibleDeliveries.find((d) => d.id === id);
    if (del) {
      setUnsoldRows(
        del.items.map((item) => ({
          skuId: item.skuId,
          skuName: item.skuName,
          deliveredQty: item.quantity,
          unsoldQty: 0,
          soldQty: item.quantity,
          aiEstimate: null,
          aiConfidence: null,
          useAI: false,
          hasDiscrepancy: false,
        })),
      );
    }
  };

  const updateUnsold = (skuId: string, unsold: number) => {
    setUnsoldRows((prev) =>
      prev.map((r) => {
        if (r.skuId !== skuId) return r;
        const clamped = Math.max(0, Math.min(unsold, r.deliveredQty));
        return {
          ...r,
          unsoldQty: clamped,
          soldQty: r.deliveredQty - clamped,
          hasDiscrepancy: r.aiEstimate !== null && Math.abs(clamped - r.aiEstimate) > 0,
        };
      }),
    );
  };

  // AI Processing
  const processAI = useCallback(async () => {
    setAiProcessing(true);
    try {
      const results = await aiService.estimateCrates(['mock-end-crate']);
      setUnsoldRows((prev) =>
        prev.map((r) => {
          const aiItem = results.find((ai) => ai.skuId === r.skuId);
          const aiEst = aiItem?.estimatedValue ?? null;
          return {
            ...r,
            aiEstimate: aiEst,
            aiConfidence: aiItem?.confidence ?? null,
            hasDiscrepancy: aiEst !== null && Math.abs(r.unsoldQty - aiEst) > 0,
          };
        }),
      );
      setAiDone(true);
    } catch (err) {
      console.error('AI processing failed:', err);
    } finally {
      setAiProcessing(false);
    }
  }, []);

  const toggleUseAI = (skuId: string) => {
    setUnsoldRows((prev) =>
      prev.map((r) => {
        if (r.skuId !== skuId || r.aiEstimate === null) return r;
        if (!r.useAI) {
          // Switch to AI value
          const newUnsold = r.aiEstimate;
          return { ...r, useAI: true, unsoldQty: newUnsold, soldQty: r.deliveredQty - newUnsold, hasDiscrepancy: false };
        } else {
          // Revert - keep current unsold value
          return { ...r, useAI: false, hasDiscrepancy: r.aiEstimate !== null && Math.abs(r.unsoldQty - r.aiEstimate) > 0 };
        }
      }),
    );
  };

  // Save
  const handleSave = () => {
    if (!delivery) return;
    setSaveLoading(true);
    setTimeout(() => {
      const items: InventoryItem[] = unsoldRows.map((r) => ({
        skuId: r.skuId,
        skuName: r.skuName,
        quantity: r.unsoldQty,
        aiEstimate: r.aiEstimate ?? undefined,
        confidence: r.aiConfidence ?? undefined,
        discrepancy: r.aiEstimate !== null ? r.unsoldQty - r.aiEstimate : undefined,
        manualOverride: !r.useAI && r.aiEstimate !== null,
      }));

      const id = `ei-${Date.now().toString(36)}`;
      addEndingInventory({
        id,
        deliveryId: delivery.id,
        storeId: delivery.storeId,
        date: new Date().toISOString().slice(0, 10),
        crateImageUrls: crateFiles.map((f) => f.preview ?? 'mock'),
        unsoldItems: items,
        aiResults: [],
        status: 'confirmed',
        notes: notes || undefined,
      });

      setSaveLoading(false);
      setShowSave(false);
      setSubmitted(true);
    }, 600);
  };

  // Summaries
  const totalSold = unsoldRows.reduce((s, r) => s + r.soldQty, 0);
  const totalUnsold = unsoldRows.reduce((s, r) => s + r.unsoldQty, 0);
  const totalDelivered = unsoldRows.reduce((s, r) => s + r.deliveredQty, 0);
  const discrepancyCount = unsoldRows.filter((r) => r.hasDiscrepancy).length;

  if (submitted) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<CheckSquare size={28} />}
          title="Ending Inventory Saved"
          description={`Ending inventory for ${delivery?.drNumber} has been reconciled.`}
          actionLabel="Process Another"
          onAction={() => {
            setSubmitted(false);
            setSelectedDeliveryId('');
            setUnsoldRows([]);
            setCrateFiles([]);
            setAiDone(false);
            setNotes('');
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ending Inventory</h1>
        <p className="text-sm text-gray-500 mt-1">Record unsold quantities and reconcile end-of-day inventory</p>
      </div>

      {/* Select Delivery */}
      <Card>
        <CardContent>
          <Select
            label="Select Delivery"
            options={deliveryOptions}
            value={selectedDeliveryId}
            onChange={(e) => handleDeliveryChange(e.target.value)}
          />
        </CardContent>
      </Card>

      {delivery && unsoldRows.length > 0 && (
        <>
          {/* Delivery Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase">DR Number</p>
              <p className="text-sm font-mono font-bold text-gray-900 mt-1">{delivery.drNumber}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase">Store</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{store?.name ?? '-'}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase">Total Delivered</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{totalDelivered}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase">SKU Count</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{unsoldRows.length}</p>
            </div>
          </div>

          {/* Unsold Input Table */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardCheck size={18} /> Unsold Quantities
              </h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2 text-left">SKU Name</th>
                      <th className="px-3 py-2 text-center">Delivered</th>
                      <th className="px-3 py-2 text-center">Unsold</th>
                      <th className="px-3 py-2 text-center">Sold</th>
                      {aiDone && (
                        <>
                          <th className="px-3 py-2 text-center">AI Estimate</th>
                          <th className="px-3 py-2 text-center">Confidence</th>
                          <th className="px-3 py-2 text-center">Use AI</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {unsoldRows.map((row) => (
                      <tr key={row.skuId} className={row.hasDiscrepancy ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {row.skuName}
                          {row.hasDiscrepancy && (
                            <AlertTriangle size={12} className="inline ml-1 text-amber-500" />
                          )}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-600">{row.deliveredQty}</td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={row.deliveredQty}
                            value={row.unsoldQty}
                            onChange={(e) => updateUnsold(row.skuId, parseInt(e.target.value) || 0)}
                            className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-zapp-orange"
                          />
                        </td>
                        <td className="px-3 py-2 text-center font-medium text-green-700">{row.soldQty}</td>
                        {aiDone && (
                          <>
                            <td className="px-3 py-2 text-center">
                              {row.aiEstimate !== null ? row.aiEstimate : '-'}
                            </td>
                            <td className="px-3 py-2 text-center">{confidenceBadge(row.aiConfidence)}</td>
                            <td className="px-3 py-2 text-center">
                              {row.aiEstimate !== null && (
                                <button
                                  onClick={() => toggleUseAI(row.skuId)}
                                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                                    row.useAI
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {row.useAI ? 'Using AI' : 'Accept AI'}
                                </button>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Upload Crate Images */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Camera size={18} /> Upload End-of-Day Crate Images
              </h2>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept="image/*"
                multiple
                maxSizeMB={10}
                onChange={setCrateFiles}
              />
              {crateFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {crateFiles.map((f) =>
                    f.preview ? (
                      <img key={f.id} src={f.preview} alt="Crate" className="h-20 w-full object-cover rounded-lg border border-gray-200" />
                    ) : null,
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Estimation */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Cpu size={18} /> AI Estimation
              </h2>
            </CardHeader>
            <CardContent>
              {!aiDone ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600 mb-4">
                    Process crate images to get AI-estimated remaining quantities.
                  </p>
                  <Button
                    variant="primary"
                    iconLeft={<Cpu size={16} />}
                    onClick={processAI}
                    loading={aiProcessing}
                  >
                    Process with AI
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-green-700 font-medium">AI estimation complete.</p>
                  {discrepancyCount > 0 && (
                    <p className="text-sm text-amber-700 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {discrepancyCount} discrepanc{discrepancyCount === 1 ? 'y' : 'ies'} between your input and AI estimate.
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    You can accept AI values or keep your manual input for each SKU in the table above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reconciliation Summary */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Save size={18} /> Save Reconciliation
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 uppercase">Total Delivered</p>
                  <p className="text-lg font-bold text-gray-900">{totalDelivered}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-600 uppercase">Total Sold</p>
                  <p className="text-lg font-bold text-green-700">{totalSold}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-amber-600 uppercase">Total Unsold</p>
                  <p className="text-lg font-bold text-amber-700">{totalUnsold}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 uppercase">Discrepancies</p>
                  <p className={`text-lg font-bold ${discrepancyCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {discrepancyCount}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this ending inventory..."
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-zapp-orange/30 focus:border-zapp-orange"
                />
              </div>

              <Button
                variant="primary"
                iconLeft={<Save size={16} />}
                onClick={() => setShowSave(true)}
                fullWidth
              >
                Save Ending Inventory
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <ConfirmDialog
        open={showSave}
        onClose={() => setShowSave(false)}
        onConfirm={handleSave}
        title="Save Ending Inventory"
        message={`Save ending inventory with ${totalSold} sold and ${totalUnsold} unsold items?`}
        confirmLabel="Save"
        loading={saveLoading}
      />
    </div>
  );
}
