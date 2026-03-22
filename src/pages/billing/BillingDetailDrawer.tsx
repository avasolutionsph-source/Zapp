import { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Building,
  Truck,
  Factory,
  Bot,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  Drawer,
  Card,
  CardContent,
  Badge,
  StatusBadge,
} from '@/components/ui';
import type { BillingRecord } from '@/types';

// ── AI Log Entry (simulated) ────────────────────────────────────────────

interface AILogEntry {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  confidence: 'high' | 'medium' | 'low';
}

function generateAILogs(billingId: string): AILogEntry[] {
  return [
    {
      id: `${billingId}-ai-1`,
      timestamp: '2026-02-28T08:00:00Z',
      action: 'DR OCR Scan',
      detail: 'Scanned delivery receipt. Extracted 12 line items with 95% average confidence.',
      confidence: 'high',
    },
    {
      id: `${billingId}-ai-2`,
      timestamp: '2026-02-28T08:02:00Z',
      action: 'Crate Count Estimation',
      detail: 'Processed 4 crate images. Estimated total units across 8 SKUs.',
      confidence: 'medium',
    },
    {
      id: `${billingId}-ai-3`,
      timestamp: '2026-02-28T08:05:00Z',
      action: 'Discrepancy Check',
      detail: 'Cross-referenced DR quantities with crate estimates. 1 minor discrepancy flagged for manual review.',
      confidence: 'medium',
    },
    {
      id: `${billingId}-ai-4`,
      timestamp: '2026-03-01T06:00:00Z',
      action: 'Billing Calculation',
      detail: 'Computed DR total, unsold deductions, and packaging costs. Generated invoice automatically.',
      confidence: 'high',
    },
  ];
}

// ── Due Timer Component ─────────────────────────────────────────────────

function DueTimer({ dueAt, status }: { dueAt: string; status: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'paid') {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle size={16} />
        <span className="text-sm font-medium">Paid</span>
      </div>
    );
  }

  const due = new Date(dueAt).getTime();
  const diff = due - now;

  if (diff <= 0) {
    const overdueDays = Math.ceil(Math.abs(diff) / (1000 * 60 * 60 * 24));
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-2">
        <AlertTriangle size={16} />
        <span className="text-sm font-bold">OVERDUE by {overdueDays} day{overdueDays !== 1 ? 's' : ''}</span>
      </div>
    );
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const isUrgent = days <= 2;

  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${isUrgent ? 'text-amber-700 bg-amber-50' : 'text-blue-700 bg-blue-50'}`}>
      <Clock size={16} />
      <span className="text-sm font-medium">
        {days}d {hours}h remaining
      </span>
    </div>
  );
}

// ── Image Modal ─────────────────────────────────────────────────────────

function ImageModal({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 p-2 rounded-full bg-white shadow-lg text-gray-600 hover:text-gray-900 z-10"
        >
          <X size={18} />
        </button>
        <div className="bg-white rounded-xl p-2 shadow-2xl">
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <ImageIcon size={48} className="mx-auto mb-2" />
              <p className="text-sm">{url}</p>
              <p className="text-xs mt-1">Image preview placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Confidence Badge ────────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const variants = { high: 'success', medium: 'warning', low: 'danger' } as const;
  return (
    <Badge variant={variants[level]} size="sm" dot>
      {level}
    </Badge>
  );
}

// ── Main Component ──────────────────────────────────────────────────────

interface BillingDetailDrawerProps {
  billing: BillingRecord | null;
  onClose: () => void;
}

export default function BillingDetailDrawer({ billing, onClose }: BillingDetailDrawerProps) {
  const { stores, distributors, plants, payments } = useStore();
  const [imageModal, setImageModal] = useState<string | null>(null);

  const store = useMemo(
    () => (billing ? stores.find((s) => s.id === billing.storeId) : null),
    [billing, stores],
  );

  const distributor = useMemo(
    () => (billing?.distributorId ? distributors.find((d) => d.id === billing.distributorId) : null),
    [billing, distributors],
  );

  const plant = useMemo(
    () => (billing ? plants.find((p) => p.id === billing.plantId) : null),
    [billing, plants],
  );

  const payment = useMemo(
    () => (billing ? payments.find((p) => p.billingId === billing.id) : null),
    [billing, payments],
  );

  const aiLogs = useMemo(
    () => (billing ? generateAILogs(billing.id) : []),
    [billing],
  );

  const franchiseModel = store?.franchiseType ?? 'direct';
  const isDistributorModel = franchiseModel === 'distributor';

  // Financial calculations for franchise model breakdown
  const grossSales = billing ? billing.drTotal : 0;
  const franchisee15 = Math.round(grossSales * 0.15);
  const distributorProfit = billing ? grossSales - billing.drTotal : 0;
  const drCost = billing?.drTotal ?? 0;
  const franchiseeProfit = grossSales - drCost;

  const formatCurrency = (n: number) => `P${n.toLocaleString()}`;

  if (!billing) return null;

  return (
    <>
      <Drawer open={!!billing} onClose={onClose} title="Billing Details" width="max-w-xl">
        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Invoice #{billing.id.toUpperCase()}</h3>
              <p className="text-sm text-gray-500">Period: {billing.period}</p>
            </div>
            <StatusBadge category="billing" status={billing.status} />
          </div>

          {/* Due Timer */}
          <DueTimer dueAt={billing.dueAt} status={billing.status} />

          {/* Store / Distributor / Plant Info */}
          <div className="grid grid-cols-1 gap-3">
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Building size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Store</p>
                      <p className="font-medium text-gray-900">{store?.name ?? billing.storeId}</p>
                      <p className="text-xs text-gray-500">{store?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Truck size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Distributor</p>
                      <p className="font-medium text-gray-900">{distributor?.name ?? 'Direct (ZAPP)'}</p>
                      {distributor && <p className="text-xs text-gray-500">{distributor.contactPerson}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Factory size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Plant</p>
                      <p className="font-medium text-gray-900">{plant?.name ?? billing.plantId}</p>
                      <p className="text-xs text-gray-500">{plant?.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Breakdown */}
          <Card>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Financial Breakdown</h4>
              <Badge variant={isDistributorModel ? 'orange' : 'info'} size="sm">
                {isDistributorModel ? 'Distributor Model' : 'Direct Model'}
              </Badge>
            </div>
            <CardContent>
              <div className="space-y-3">
                {/* Main formula breakdown */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">DR Total</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(billing.drTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600">- Unsold Deduction</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(billing.unsoldDeduction)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600">+ Packaging Total</span>
                    <span className="font-semibold text-blue-600">+{formatCurrency(billing.packagingTotal)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                    <span className="font-bold text-gray-900">= Total Payable</span>
                    <span className="text-lg font-bold text-zapp-orange">{formatCurrency(billing.totalPayable)}</span>
                  </div>
                </div>

                {/* Formula display */}
                <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-2">
                  <p className="text-xs text-zapp-orange font-mono font-medium">
                    Total Payable = (DR Total - Unsold) + Packaging Total
                  </p>
                </div>

                {/* Franchise model details */}
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {isDistributorModel ? 'Distributor Model Breakdown' : 'Direct Model Breakdown'}
                  </p>
                  {isDistributorModel ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Gross Sales (SRP)</span>
                        <span className="font-medium text-gray-900">{formatCurrency(grossSales)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Franchisee Share (15%)</span>
                        <span className="font-medium text-green-600">{formatCurrency(franchisee15)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Distributor Profit</span>
                        <span className="font-medium text-gray-900">{formatCurrency(distributorProfit)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Gross Sales (SRP est.)</span>
                        <span className="font-medium text-gray-900">{formatCurrency(grossSales)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">DR Cost</span>
                        <span className="font-medium text-gray-900">{formatCurrency(drCost)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Franchisee Profit</span>
                        <span className="font-medium text-green-600">{formatCurrency(franchiseeProfit)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attached Files */}
          <Card>
            <div className="px-4 py-3 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900">Attached Files</h4>
            </div>
            <CardContent>
              <div className="space-y-2">
                {billing.invoiceFileUrl && (
                  <button
                    onClick={() => setImageModal(billing.invoiceFileUrl!)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-zapp-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Billing Invoice</p>
                      <p className="text-xs text-gray-500">{billing.invoiceFileUrl}</p>
                    </div>
                    <Download size={16} className="text-gray-400" />
                  </button>
                )}
                {billing.paymentProofUrl && (
                  <button
                    onClick={() => setImageModal(billing.paymentProofUrl!)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                      <ImageIcon size={18} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Payment Proof</p>
                      <p className="text-xs text-gray-500">{billing.paymentProofUrl}</p>
                    </div>
                    <Download size={16} className="text-gray-400" />
                  </button>
                )}
                {!billing.invoiceFileUrl && !billing.paymentProofUrl && (
                  <p className="text-sm text-gray-400 text-center py-4">No files attached</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          {payment && (
            <Card>
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard size={16} />
                  Payment Info
                </h4>
              </div>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-mono font-medium text-gray-900">{payment.referenceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <Badge variant={payment.method === 'gateway' ? 'info' : 'neutral'} size="sm">
                      {payment.method === 'gateway' ? 'Gateway' : 'Manual'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date Paid</span>
                    <span className="text-gray-900">{new Date(payment.datePaid).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <StatusBadge category="payment" status={payment.status} />
                  </div>
                  {payment.verifiedBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Verified By</span>
                      <span className="text-gray-900">{payment.verifiedBy}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Logs */}
          <Card>
            <div className="px-4 py-3 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Bot size={16} className="text-zapp-orange" />
                AI Processing Logs
              </h4>
            </div>
            <CardContent>
              <div className="space-y-3">
                {aiLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-zapp-orange mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{log.action}</span>
                        <ConfidenceBadge level={log.confidence} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{log.detail}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Drawer>

      {/* Image Viewer Modal */}
      {imageModal && <ImageModal url={imageModal} onClose={() => setImageModal(null)} />}
    </>
  );
}
