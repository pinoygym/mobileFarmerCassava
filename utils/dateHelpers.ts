export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateInput(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function getDaysUntilHarvest(harvestDate: string): number {
  if (!harvestDate) return 0;
  const harvest = new Date(harvestDate);
  const today = new Date();
  const diffTime = harvest.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getHarvestStatus(harvestDate: string): {
  status: 'overdue' | 'due-soon' | 'upcoming' | 'future';
  color: string;
  text: string;
} {
  const days = getDaysUntilHarvest(harvestDate);
  
  if (days < 0) {
    return { status: 'overdue', color: '#EF4444', text: 'Overdue' };
  } else if (days <= 3) {
    return { status: 'due-soon', color: '#F59E0B', text: 'Due Soon' };
  } else if (days <= 7) {
    return { status: 'upcoming', color: '#EAB308', text: 'This Week' };
  } else {
    return { status: 'future', color: '#22C55E', text: 'Scheduled' };
  }
}