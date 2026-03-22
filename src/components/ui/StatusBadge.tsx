import { Badge } from './Badge';

/* ------------------------------------------------------------------ */
/*  Status configuration maps                                          */
/* ------------------------------------------------------------------ */

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'orange';

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

const applicationStatuses: Record<string, StatusConfig> = {
  pending:  { label: 'Pending',  variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  declined: { label: 'Declined', variant: 'danger' },
};

const deliveryStatuses: Record<string, StatusConfig> = {
  scheduled:   { label: 'Scheduled',   variant: 'info' },
  in_transit:  { label: 'In Transit',  variant: 'warning' },
  delivered:   { label: 'Delivered',   variant: 'success' },
  reconciled:  { label: 'Reconciled',  variant: 'neutral' },
};

const paymentStatuses: Record<string, StatusConfig> = {
  submitted: { label: 'Submitted', variant: 'warning' },
  verified:  { label: 'Verified',  variant: 'success' },
  rejected:  { label: 'Rejected',  variant: 'danger' },
};

const billingStatuses: Record<string, StatusConfig> = {
  pending: { label: 'Pending', variant: 'warning' },
  issued:  { label: 'Issued',  variant: 'info' },
  paid:    { label: 'Paid',    variant: 'success' },
  overdue: { label: 'Overdue', variant: 'danger' },
};

const storeStatuses: Record<string, StatusConfig> = {
  active:   { label: 'Active',   variant: 'success' },
  inactive: { label: 'Inactive', variant: 'neutral' },
  pending:  { label: 'Pending',  variant: 'warning' },
  blocked:  { label: 'Blocked',  variant: 'danger' },
};

const categoryMap: Record<string, Record<string, StatusConfig>> = {
  application: applicationStatuses,
  delivery: deliveryStatuses,
  payment: paymentStatuses,
  billing: billingStatuses,
  store: storeStatuses,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type StatusCategory = 'application' | 'delivery' | 'payment' | 'billing' | 'store';

interface StatusBadgeProps {
  category: StatusCategory;
  status: string;
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ category, status, dot = true, size = 'md', className }: StatusBadgeProps) {
  const config = categoryMap[category]?.[status];

  if (!config) {
    return (
      <Badge variant="neutral" size={size} dot={dot} className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} size={size} dot={dot} className={className}>
      {config.label}
    </Badge>
  );
}
