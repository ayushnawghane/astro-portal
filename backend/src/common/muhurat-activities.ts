export const MUHURAT_ACTIVITIES = [
  'marriage',
  'griha-pravesh',
  'vehicle-purchase',
  'naming-ceremony',
  'business-opening',
  'engagement',
  'mundan',
  'travel',
] as const;

export type MuhuratActivity = (typeof MUHURAT_ACTIVITIES)[number];
