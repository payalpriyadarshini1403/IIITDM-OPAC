type Status = 'available' | 'limited' | 'unavailable';

interface StatusBadgeProps {
  status: Status;
}

const CONFIG = {
  available:   { bg: '#ECFDF5', color: '#047857', label: 'Available',   dot: '#047857' },
  limited:     { bg: '#FFFBEB', color: '#B45309', label: 'Limited',     dot: '#B45309' },
  unavailable: { bg: '#FEF2F2', color: '#B91C1C', label: 'Unavailable', dot: '#B91C1C' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, color, label, dot } = CONFIG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '999px',
      backgroundColor: bg, color,
      fontSize: '11px', fontWeight: 500,
    }}>
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%',
        backgroundColor: dot, flexShrink: 0,
      }} />
      {label}
    </span>
  );
}
