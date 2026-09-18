export function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 7) return '***';
  const prefix = mobile.slice(0, 3);
  const suffix = mobile.slice(-4);
  const maskedLength = Math.max(3, mobile.length - 7);
  return `${prefix}${'*'.repeat(maskedLength)}${suffix}`;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.com';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const prefix = local.slice(0, 2);
  const suffix = local.slice(-1);
  return `${prefix}${'*'.repeat(Math.max(2, local.length - 3))}${suffix}@${domain}`;
}
