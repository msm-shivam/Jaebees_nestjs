export function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 7) return '***';
  const prefix = mobile.slice(0, 3);
  const suffix = mobile.slice(-4);
  const maskedLength = Math.max(3, mobile.length - 7);
  return `${prefix}${'*'.repeat(maskedLength)}${suffix}`;
}
