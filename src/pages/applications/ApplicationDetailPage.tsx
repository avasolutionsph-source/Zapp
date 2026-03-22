import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  Building2,
  FileImage,
  IdCard,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  StatusBadge,
  Modal,
  Input,
  ConfirmDialog,
  EmptyState,
  Skeleton,
} from '@/components/ui';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    applications,
    plants,
    distributors,
    areaManagers,
    currentUser,
    reviewApplication,
  } = useStore();

  const application = useMemo(
    () => applications.find((a) => a.id === id),
    [applications, id],
  );

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [notes, setNotes] = useState(application?.notes ?? '');
  const [showApprove, setShowApprove] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!application) {
    return (
      <div className="p-6">
        <EmptyState
          title="Application Not Found"
          description="The application you are looking for does not exist."
          actionLabel="Back to Applications"
          onAction={() => navigate('/applications')}
        />
      </div>
    );
  }

  const plant = plants.find((p) => p.id === application.assignedPlantId);
  const distributor = application.assignedDistributorId
    ? distributors.find((d) => d.id === application.assignedDistributorId)
    : null;
  const areaManager = application.assignedAreaManagerId
    ? areaManagers.find((a) => a.id === application.assignedAreaManagerId)
    : null;

  const isPending = application.status === 'pending';

  const handleAction = (action: 'approved' | 'declined') => {
    setActionLoading(true);
    setTimeout(() => {
      reviewApplication(
        application.id,
        action,
        currentUser?.id ?? 'system',
        notes || undefined,
      );
      setActionLoading(false);
      setShowApprove(false);
      setShowDecline(false);
    }, 600);
  };

  const openPreview = (url: string, title: string) => {
    setPreviewImage(url);
    setPreviewTitle(title);
  };

  const docPlaceholder = 'https://placehold.co/600x400/f97316/white?text=';

  return (
    <div className="p-6 space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          iconLeft={<ArrowLeft size={16} />}
          onClick={() => navigate('/applications')}
        >
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {application.fullName}
            </h1>
            <StatusBadge category="application" status={application.status} size="md" />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Application ID: {application.id}
          </p>
        </div>
        {isPending && (
          <div className="flex gap-2">
            <Button
              variant="danger"
              iconLeft={<XCircle size={16} />}
              onClick={() => setShowDecline(true)}
            >
              Decline
            </Button>
            <Button
              variant="primary"
              iconLeft={<CheckCircle2 size={16} />}
              onClick={() => setShowApprove(true)}
            >
              Approve
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User size={18} /> Applicant Information
            </h2>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{application.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</dt>
                <dd className="mt-1 text-sm text-gray-700 flex items-center gap-1">
                  <Phone size={14} className="text-gray-400" /> {application.mobile}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</dt>
                <dd className="mt-1 text-sm text-gray-700 flex items-center gap-1">
                  <Mail size={14} className="text-gray-400" /> {application.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Store Name</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{application.storeName}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</dt>
                <dd className="mt-1 text-sm text-gray-700 flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" /> {application.address}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Latitude</dt>
                <dd className="mt-1 text-sm text-gray-700 font-mono">{application.lat}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Longitude</dt>
                <dd className="mt-1 text-sm text-gray-700 font-mono">{application.lng}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Referral Info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 size={18} /> Referral & Assignment
            </h2>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</dt>
                <dd className="mt-1 text-sm font-mono font-medium text-gray-900">{application.referralCode}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Type</dt>
                <dd className="mt-1">
                  <Badge variant={application.referralType === 'distributor' ? 'info' : 'orange'} size="sm">
                    {application.referralType === 'distributor' ? 'Distributor' : 'ZAPP Internal'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</dt>
                <dd className="mt-1 text-sm text-gray-700">{distributor?.name ?? 'N/A (Direct)'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Area Manager</dt>
                <dd className="mt-1 text-sm text-gray-700">{areaManager?.name ?? 'Not Assigned'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</dt>
                <dd className="mt-1 text-sm text-gray-700">{plant?.name ?? '-'} ({plant?.code ?? '-'})</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</dt>
                <dd className="mt-1 text-sm text-gray-700">
                  {new Date(application.submittedAt).toLocaleString()}
                </dd>
              </div>
              {application.reviewedAt && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed At</dt>
                  <dd className="mt-1 text-sm text-gray-700">
                    {new Date(application.reviewedAt).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Store Photo', url: application.storePhotoUrl, icon: <FileImage size={20} /> },
              { label: 'Government ID', url: application.govIdUrl, icon: <IdCard size={20} /> },
              { label: 'Proof of Billing', url: application.proofOfBillingUrl, icon: <Receipt size={20} /> },
            ].map((doc) => (
              <button
                key={doc.label}
                onClick={() => openPreview(doc.url || `${docPlaceholder}${encodeURIComponent(doc.label)}`, doc.label)}
                className="group relative rounded-xl border border-gray-200 bg-gray-50 overflow-hidden aspect-video flex items-center justify-center hover:border-zapp-orange transition-colors cursor-pointer"
              >
                {doc.url ? (
                  <img
                    src={doc.url}
                    alt={doc.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `${docPlaceholder}${encodeURIComponent(doc.label)}`;
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    {doc.icon}
                    <span className="text-xs">{doc.label}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium bg-black/50 px-3 py-1 rounded-full transition-opacity">
                    Click to view
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviewer Notes */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Reviewer Notes</h2>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this application..."
            rows={3}
            disabled={!isPending}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-zapp-orange/30 focus:border-zapp-orange disabled:bg-gray-50 disabled:text-gray-500"
          />
          {application.notes && !isPending && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Previous note:</span> {application.notes}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Audit Timeline */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Audit Timeline</h2>
        </CardHeader>
        <CardContent>
          {application.auditLog.length === 0 ? (
            <p className="text-sm text-gray-500">No audit entries yet.</p>
          ) : (
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
              {application.auditLog.map((entry) => {
                const isApproved = entry.action === 'approved';
                const isDeclined = entry.action === 'declined';
                return (
                  <div key={entry.id} className="relative">
                    <div
                      className={`absolute -left-4 top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                        isApproved
                          ? 'bg-green-500'
                          : isDeclined
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {entry.action}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.performedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{entry.details}</p>
                      <p className="text-xs text-gray-400 mt-0.5">By: {entry.performedBy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      <Modal
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        title={previewTitle}
        size="lg"
      >
        {previewImage && (
          <img
            src={previewImage}
            alt={previewTitle}
            className="w-full rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `${docPlaceholder}${encodeURIComponent(previewTitle)}`;
            }}
          />
        )}
      </Modal>

      {/* Approve Dialog */}
      <ConfirmDialog
        open={showApprove}
        onClose={() => setShowApprove(false)}
        onConfirm={() => handleAction('approved')}
        title="Approve Application"
        message={`Are you sure you want to approve the application from "${application.fullName}"? This will create a new franchise store account.`}
        confirmLabel="Approve"
        loading={actionLoading}
      />

      {/* Decline Dialog */}
      <ConfirmDialog
        open={showDecline}
        onClose={() => setShowDecline(false)}
        onConfirm={() => handleAction('declined')}
        title="Decline Application"
        message={`Are you sure you want to decline the application from "${application.fullName}"? This action cannot be undone.`}
        confirmLabel="Decline"
        danger
        loading={actionLoading}
      />
    </div>
  );
}
