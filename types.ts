
export enum SubscriptionTier {
  FREE = 'GRATUITO',
  PREMIUM = 'PREMIUM'
}

export enum PromptCategory {
  LOGO = 'Design de Logo',
  ART = 'Artístico/Abstrato',
  REALISM = 'Hiper-Realismo',
  GENERAL = 'Geral/Criativo'
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  description: string;
  template: string;
  icon: string;
  premiumOnly: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  tier: SubscriptionTier;
  credits: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
