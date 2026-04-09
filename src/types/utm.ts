export interface UTMTag {
  id: string;
  title: string;
  landingUrl: string;
  generatedUrl: string;
  // Category classification
  brand: string;
  product: string;
  // UTM parameters
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  // Metadata
  createdAt: string;
}

export const UTM_SOURCES = [
  'google', 'youtube', 'instagram', 'facebook', 'tiktok',
  'naver', 'kakao', 'twitter', 'toss'
] as const;

export const UTM_MEDIUMS = [
  'cpc', 'display', 'shopping', 'video', 'social',
  'retargeting', 'email', 'sms', 'organic', 'affiliate',
  'referral'
] as const;

export const UTM_SOURCE_LABELS: Record<string, string> = {
  google: 'Google',
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  naver: 'Naver',
  kakao: 'Kakao',
  twitter: 'Twitter/X',
  toss: 'Toss',
};

export const UTM_MEDIUM_LABELS: Record<string, string> = {
  cpc: 'CPC (검색 광고)',
  display: 'Display',
  shopping: 'Shopping',
  video: 'Video',
  social: 'Social',
  retargeting: 'Retargeting',
  email: 'Email',
  sms: 'SMS',
  organic: 'Organic (자연 유입)',
  affiliate: 'Affiliate (제휴)',
  referral: 'Referral',
};
