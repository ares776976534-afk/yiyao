import dayjs from 'dayjs';
import type { ConfigType } from 'dayjs';
import type { listDataProps } from './interface';

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function filterListByParams(
  list: listDataProps[],
  filterParams: Record<string, unknown>,
): listDataProps[] {
  const priceStart = num(filterParams.priceStart);
  const priceEnd = num(filterParams.priceEnd);
  const ratingStart = num(filterParams.ratingStart);
  const ratingEnd = num(filterParams.ratingEnd);
  const sold30dMin = num(filterParams.sold30d);
  const launchRange = filterParams.launchTime;

  return list.filter((row) => {
    if (priceStart != null && row.sellingPrice < priceStart) return false;
    if (priceEnd != null && row.sellingPrice > priceEnd) return false;
    if (ratingStart != null && row.ratingScore < ratingStart) return false;
    if (ratingEnd != null && row.ratingScore > ratingEnd) return false;
    if (sold30dMin != null && row.sold30d < sold30dMin) return false;
    if (
      launchRange != null &&
      Array.isArray(launchRange) &&
      launchRange.length >= 2 &&
      launchRange[0] != null &&
      launchRange[1] != null
    ) {
      const start = dayjs(launchRange[0] as ConfigType).startOf('day');
      const end = dayjs(launchRange[1] as ConfigType).endOf('day');
      const t = dayjs(row.launchTime);
      if (t.isBefore(start) || t.isAfter(end)) return false;
    }
    return true;
  });
}

export function sortListByField(
  list: listDataProps[],
  sortField: string,
  sortType: string,
): listDataProps[] {
  if (!sortField || sortField === 'relation') {
    return list;
  }
  const next = [...list];
  next.sort((a, b) => {
    if (sortField === 'sellingPrice') {
      const diff = a.sellingPrice - b.sellingPrice;
      return sortType === 'ASC' ? diff : -diff;
    }
    if (sortField === 'sold30d') {
      const diff = a.sold30d - b.sold30d;
      return sortType === 'ASC' ? diff : -diff;
    }
    return 0;
  });
  return next;
}
