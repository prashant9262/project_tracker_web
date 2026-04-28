import { useEffect } from 'react';
import { Filters, Priority, TaskStatus } from '../types';

const statuses: TaskStatus[] = ['todo', 'inProgress', 'inReview', 'done'];
const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];

const pickMany = <T extends string>(value: string | null, allowed: T[]): T[] => {
  if (!value) return [];
  const set = new Set(allowed);
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v): v is T => set.has(v as T));
};

export function readFiltersFromUrl(): Filters {
  const params = new URLSearchParams(window.location.search);
  return {
    statuses: pickMany(params.get('status'), statuses),
    priorities: pickMany(params.get('priority'), priorities),
    assignees: params.get('assignee')?.split(',').filter(Boolean) ?? [],
    dueFrom: params.get('dueFrom') || undefined,
    dueTo: params.get('dueTo') || undefined
  };
}

export function useUrlFiltersSync(filters: Filters) {
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.statuses.length > 0) params.set('status', filters.statuses.join(','));
    if (filters.priorities.length > 0) params.set('priority', filters.priorities.join(','));
    if (filters.assignees.length > 0) params.set('assignee', filters.assignees.join(','));
    if (filters.dueFrom) params.set('dueFrom', filters.dueFrom);
    if (filters.dueTo) params.set('dueTo', filters.dueTo);
    const next = params.toString();

    const currentSearch = window.location.search.startsWith('?') ? window.location.search.slice(1) : window.location.search;
    // Avoid replaceState churn (and any potential popstate edge cases) when nothing actually changed.
    if (next === currentSearch) return;

    const url = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    window.history.replaceState({}, '', url);
  }, [filters]);
}
