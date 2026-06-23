export function generateClientId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  const suffix = Date.now().toString(36).slice(-4);
  return `uc_${slug}_${suffix}`;
}

export function generateVisitCardId(): string {
  return `vc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
