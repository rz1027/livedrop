
export function paginateParams(page?: number, limit?: number) {
  const p = Math.max(1, Number(page || 1));
  const l = Math.min(100, Math.max(1, Number(limit || 20)));
  const offset = (p - 1) * l;
  return { limit: l, offset, page: p };
}
