export function parseId(value: string | null | undefined) {
  const id = Number(value);
  return value != null && Number.isInteger(id) && id > 0 ? id : null;
}
