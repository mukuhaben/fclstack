export const formatPrice = (value) => {
  if (value == null) return "—";
  return `KES ${Number(value).toLocaleString()}`;
};
