// Shared types between frontend and backend

export interface PresentationBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'chart' | 'cta' | 'form' | 'embed' | 'logo' | 'stats' | 'quote';
  content: any;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    alignment?: 'left' | 'center' | 'right';
    fontSize?: string;
    fontWeight?: string;
    [key: string]: any;
  };
  animation?: {
    type: 'fade' | 'slide' | 'scale' | 'none';
    duration?: number;
    delay?: number;
  };
}

export interface PresentationSection {
  id: string;
  title?: string;
  blocks: PresentationBlock[];
  layout: 'single' | 'two-column' | 'three-column' | 'hero' | 'split';
  background?: {
    type: 'color' | 'gradient' | 'image';
    value: string;
  };
  style?: Record<string, any>;
}

export interface PresentationContent {
  sections: PresentationSection[];
  metadata: {
    title: string;
    description?: string;
    author?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface PresentationSettings {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    logoUrl?: string;
  };
  protection?: {
    password?: string;
    gatedContent?: boolean;
    requireEmail?: boolean;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  tracking?: {
    enableAnalytics: boolean;
    googleAnalyticsId?: string;
  };
}

export interface DynamicVariable {
  key: string;
  type: 'text' | 'number' | 'link' | 'date' | 'array' | 'logo';
  value: any;
  label: string;
}

export interface PresentationVersion {
  id: string;
  presentationId: string;
  versionSlug: string;
  editToken: string;
  viewToken: string;
  recipientName?: string;
  recipientEmail?: string;
  variables: Record<string, any>;
  password?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  viewUrl: string;
  editUrl: string;
}

export interface AnalyticsData {
  totalViews: number;
  uniqueViewers: number;
  avgTimeSpent: number; // seconds
  scrollDepthAvg: number; // percentage
  topSections: Array<{
    sectionId: string;
    views: number;
    avgTime: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  locationData: Array<{
    country: string;
    count: number;
  }>;
}

export interface ViewSession {
  id: string;
  versionId: string;
  sessionId: string;
  timeSpent: number;
  scrollDepth: number;
  sectionsViewed: string[];
  clicks: Array<{
    elementId: string;
    timestamp: string;
  }>;
  device?: string;
  browser?: string;
  country?: string;
  viewedAt: string;
}

export interface PipedriveWebhookPayload {
  current: {
    id: number;
    title: string;
    value: number;
    currency: string;
    person_id: {
      name: string;
      email: string[];
    };
    org_id: {
      name: string;
    };
    [key: string]: any;
  };
  previous?: any;
  event: string;
}

export interface JustJoinITProposal {
  // Client data
  clientName: string;
  clientEmail?: string;

  // Offer details
  offerTitle: string;
  offerDate: string;
  validUntil?: string;

  // Packages
  packages: Array<{
    name: string;
    type: 'Enterprise' | 'Enterprise Boost' | 'No-limit' | 'Super No-limit';
    jobPostings: number;
    boost: number;
    locations: number;
    price: number;
    regularPrice?: number;
    features: string[];
    highlighted?: boolean;
  }>;

  // Additional services
  socialBoost?: {
    quantity: number;
    price: number;
  };

  companyProfile?: {
    type: 'Professional' | 'Business' | 'Expert';
    price: number;
    regularPrice?: number;
  };

  banners?: Array<{
    type: string;
    duration: string;
    price: number;
  }>;

  // Account manager
  accountManager: {
    name: string;
    email: string;
    phone: string;
    photo?: string;
  };

  // Branding
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;

  // Summary
  totalPrice: number;
  totalRegularPrice?: number;
  savings?: number;

  // Custom sections
  customMessage?: string;
  termsAndConditions?: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail?: string;
  requiredVariables: DynamicVariable[];
  defaultContent: PresentationContent;
  defaultSettings: PresentationSettings;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
