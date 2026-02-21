
import { PromptCategory, PromptTemplate } from './types';

export const TEMPLATES: PromptTemplate[] = [
  {
    id: 'logo-vector',
    name: 'Identidade Vetorial',
    category: PromptCategory.LOGO,
    description: 'Logos minimalistas em vetor com estética de design flat.',
    template: 'Crie um logo vetorial de alta qualidade para uma empresa chamada [TOPIC]. O estilo deve ser [STYLE], usando uma paleta de cores [COLORS]. Fundo branco sólido. Linhas profissionais e limpas.',
    icon: '🎯',
    premiumOnly: false
  },
  {
    id: 'realism-photo',
    name: 'Cinematográfico 8K',
    category: PromptCategory.REALISM,
    description: 'Imagens fotorealistas com iluminação cinematográfica de ponta.',
    template: 'Uma fotografia hiper-realista em 8K de [TOPIC]. Tirada com lente 35mm, f/1.8, iluminação cinematográfica, névoa volumétrica, detalhes intrincados, foco nítido, ray tracing, qualidade de obra de arte.',
    icon: '📸',
    premiumOnly: true
  },
  {
    id: 'digital-art',
    name: 'Visão Cyberpunk',
    category: PromptCategory.ART,
    description: 'Arte digital futurista com infusão de neon.',
    template: 'Uma pintura digital futurista de [TOPIC] em estética cyberpunk. Brilho neon, ruas chuvosas, alto contraste, ambiente detalhado, estilo concept art, em alta no ArtStation.',
    icon: '🎨',
    premiumOnly: false
  },
  {
    id: 'architectural',
    name: 'Eco-Futurismo',
    category: PromptCategory.ART,
    description: 'Conceitos de edifícios futuristas sustentáveis.',
    template: 'Visualização arquitetônica de [TOPIC]. Formas biomórficas, vegetação integrada, vidro e concreto branco, iluminação de pôr do sol, texturas realistas, atmosfera utópica.',
    icon: '🏢',
    premiumOnly: true
  }
];
