import { Agent, Badge, UserProfile } from '../types';
import sarahChenAvatar from '../assets/avatars/sarah-chen.jpg';
import alexKimAvatar from '../assets/avatars/alex-kim.jpg';
import davidChangAvatar from '../assets/avatars/david-chang.jpg';
import emmaFosterAvatar from '../assets/avatars/emma-foster.jpg';

export const allAgents: Agent[] = [
  // Product Management Agents (Blue Family)
  {
    id: 'sarah-pm',
    name: 'Sarah Chen',
    specialty: 'Product Strategy',
    avatar: sarahChenAvatar,
    backstory: 'Former Google PM with 8 years experience in product strategy and roadmap planning. Expert at translating business requirements into actionable development tasks.',
    capabilities: ['Roadmap Planning', 'User Research', 'Stakeholder Management', 'MVP Definition'],
    tags: ['Strategy', 'Analytics', 'Leadership', 'Communication'],
    xpRequired: 0,
    familyColor: 'blue'
  },
  {
    id: 'marcus-scrum',
    name: 'Marcus Rodriguez',
    specialty: 'Scrum Master',
    avatar: '/api/placeholder/64/64?text=MR',
    backstory: 'Certified Scrum Master with expertise in agile methodologies and team coordination. Passionate about removing blockers and optimizing team velocity.',
    capabilities: ['Sprint Planning', 'Team Facilitation', 'Impediment Removal', 'Process Optimization'],
    tags: ['Agile', 'Leadership', 'Communication', 'Process'],
    xpRequired: 150,
    familyColor: 'blue'
  },
  {
    id: 'lisa-analytics',
    name: 'Lisa Thompson',
    specialty: 'Product Analytics',
    avatar: '/api/placeholder/64/64?text=LT',
    backstory: 'Data-driven product analyst with expertise in user behavior analysis and conversion optimization. Former Mixpanel and Amplitude consultant.',
    capabilities: ['Data Analysis', 'A/B Testing', 'User Metrics', 'Conversion Optimization'],
    tags: ['Analytics', 'Data Science', 'Metrics', 'Testing'],
    xpRequired: 300,
    familyColor: 'blue'
  },

  // Design Agents (Green Family)
  {
    id: 'alex-ux',
    name: 'Alex Kim',
    specialty: 'UX Designer',
    avatar: alexKimAvatar,
    backstory: 'Award-winning UX designer with 6 years at Airbnb and Figma. Specializes in user-centered design and complex workflow simplification.',
    capabilities: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing'],
    tags: ['UX', 'Research', 'Prototyping', 'Testing'],
    xpRequired: 0,
    familyColor: 'green'
  },
  {
    id: 'maya-ui',
    name: 'Maya Patel',
    specialty: 'UI Designer',
    avatar: '/api/placeholder/64/64?text=MP',
    backstory: 'Visual design expert with a passion for creating beautiful, accessible interfaces. Previously led design systems at Stripe and Shopify.',
    capabilities: ['Visual Design', 'Design Systems', 'Accessibility', 'Brand Guidelines'],
    tags: ['UI', 'Design Systems', 'Accessibility', 'Branding'],
    xpRequired: 100,
    familyColor: 'green'
  },
  {
    id: 'jordan-brand',
    name: 'Jordan Williams',
    specialty: 'Brand Designer',
    avatar: '/api/placeholder/64/64?text=JW',
    backstory: 'Creative brand strategist who has worked with Fortune 500 companies. Expert in visual identity and brand consistency across all touchpoints.',
    capabilities: ['Brand Strategy', 'Visual Identity', 'Marketing Materials', 'Brand Guidelines'],
    tags: ['Branding', 'Visual Identity', 'Creative', 'Strategy'],
    xpRequired: 250,
    familyColor: 'green'
  },

  // Development Agents (Purple Family)
  {
    id: 'david-fullstack',
    name: 'David Chang',
    specialty: 'Full-Stack Developer',
    avatar: davidChangAvatar,
    backstory: 'Senior full-stack engineer with expertise in React, Node.js, and cloud architecture. Former tech lead at Netflix and Meta.',
    capabilities: ['Frontend Development', 'Backend APIs', 'Database Design', 'Cloud Architecture'],
    tags: ['React', 'Node.js', 'AWS', 'TypeScript'],
    xpRequired: 0,
    familyColor: 'purple'
  },
  {
    id: 'zoe-frontend',
    name: 'Zoe Martinez',
    specialty: 'Frontend Specialist',
    avatar: '/api/placeholder/64/64?text=ZM',
    backstory: 'Frontend virtuoso specializing in React, Vue, and modern web technologies. Known for creating lightning-fast, accessible user interfaces.',
    capabilities: ['React/Vue Development', 'Performance Optimization', 'Web Standards', 'Responsive Design'],
    tags: ['Frontend', 'React', 'Performance', 'Accessibility'],
    xpRequired: 0,
    familyColor: 'purple'
  },
  {
    id: 'raj-backend',
    name: 'Raj Singh',
    specialty: 'Backend Engineer',
    avatar: '/api/placeholder/64/64?text=RS',
    backstory: 'Backend systems expert with deep knowledge of microservices, databases, and API design. Previously scaled systems at Uber and Stripe.',
    capabilities: ['API Development', 'Database Optimization', 'Microservices', 'System Design'],
    tags: ['Backend', 'APIs', 'Databases', 'Microservices'],
    xpRequired: 120,
    familyColor: 'purple'
  },
  {
    id: 'elena-devops',
    name: 'Elena Volkov',
    specialty: 'DevOps Engineer',
    avatar: '/api/placeholder/64/64?text=EV',
    backstory: 'Infrastructure and deployment specialist with expertise in Kubernetes, Docker, and CI/CD pipelines. Former SRE at Google.',
    capabilities: ['CI/CD Pipelines', 'Container Orchestration', 'Infrastructure as Code', 'Monitoring'],
    tags: ['DevOps', 'Kubernetes', 'Docker', 'Monitoring'],
    xpRequired: 200,
    familyColor: 'purple'
  },

  // Marketing & Growth Agents (Orange Family)
  {
    id: 'emma-growth',
    name: 'Emma Foster',
    specialty: 'Growth Marketer',
    avatar: emmaFosterAvatar,
    backstory: 'Growth hacking expert who has scaled startups from 0 to millions of users. Specializes in viral mechanics and conversion funnels.',
    capabilities: ['Growth Hacking', 'A/B Testing', 'Conversion Optimization', 'Viral Mechanics'],
    tags: ['Growth', 'Marketing', 'Analytics', 'Conversion'],
    xpRequired: 0,
    familyColor: 'orange'
  },
  {
    id: 'carlos-content',
    name: 'Carlos Rivera',
    specialty: 'Content Strategist',
    avatar: '/api/placeholder/64/64?text=CR',
    backstory: 'Content marketing veteran with a track record of building engaged communities. Expert in storytelling and content distribution strategies.',
    capabilities: ['Content Strategy', 'Copywriting', 'SEO Optimization', 'Community Building'],
    tags: ['Content', 'SEO', 'Community', 'Storytelling'],
    xpRequired: 80,
    familyColor: 'orange'
  },
  {
    id: 'natasha-social',
    name: 'Natasha Lee',
    specialty: 'Social Media Manager',
    avatar: '/api/placeholder/64/64?text=NL',
    backstory: 'Social media savant who has managed campaigns for major brands. Expert in viral content creation and community engagement.',
    capabilities: ['Social Media Strategy', 'Community Management', 'Viral Content', 'Influencer Relations'],
    tags: ['Social Media', 'Community', 'Viral', 'Engagement'],
    xpRequired: 180,
    familyColor: 'orange'
  },
  {
    id: 'kevin-ads',
    name: 'Kevin Park',
    specialty: 'Paid Acquisition',
    avatar: '/api/placeholder/64/64?text=KP',
    backstory: 'Performance marketing expert specializing in paid acquisition across Google, Facebook, and emerging channels. ROI optimization specialist.',
    capabilities: ['Paid Advertising', 'Campaign Optimization', 'Attribution Modeling', 'Budget Management'],
    tags: ['Paid Ads', 'PPC', 'ROI', 'Attribution'],
    xpRequired: 350,
    familyColor: 'orange'
  },

  // Specialized Agents
  {
    id: 'sophia-ai',
    name: 'Dr. Sophia Chen',
    specialty: 'AI/ML Engineer',
    avatar: '/api/placeholder/64/64?text=SC2',
    backstory: 'AI researcher with PhD from Stanford. Expert in machine learning, natural language processing, and computer vision applications.',
    capabilities: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
    tags: ['AI', 'ML', 'Python', 'Research'],
    xpRequired: 500,
    familyColor: 'purple'
  },
  {
    id: 'thomas-security',
    name: 'Thomas Anderson',
    specialty: 'Security Specialist',
    avatar: '/api/placeholder/64/64?text=TA',
    backstory: 'Cybersecurity expert with experience in penetration testing, security audits, and compliance. Former security consultant for Fortune 100.',
    capabilities: ['Security Audits', 'Penetration Testing', 'Compliance', 'Risk Assessment'],
    tags: ['Security', 'Compliance', 'Risk', 'Auditing'],
    xpRequired: 400,
    familyColor: 'purple'
  }
];

export const badges: Badge[] = [
  {
    id: 'first-squad',
    name: 'Squad Leader',
    description: 'Created your first AI squad',
    icon: '👥',
    unlockedAt: new Date()
  },
  {
    id: 'chat-master',
    name: 'Chat Master',
    description: 'Had 50 conversations with agents',
    icon: '💬',
    unlockedAt: new Date()
  },
  {
    id: 'agent-collector',
    name: 'Agent Collector',
    description: 'Unlocked 10 different agents',
    icon: '🎯',
    unlockedAt: new Date()
  }
];

export const createDemoUser = (): UserProfile => ({
  id: 'demo-user',
  name: 'Alex Demo',
  role: 'Product Manager',
  level: 5,
  xp: 750,
  streak: 7,
  unlockedAgents: [
    'sarah-pm', 'alex-ux', 'david-fullstack', 'zoe-frontend', 'emma-growth', 'maya-ui', 'carlos-content'
  ],
  badges: badges
});

// Get agents available to user based on XP
export const getAvailableAgents = (userXP: number): Agent[] => {
  return allAgents.filter(agent => agent.xpRequired <= userXP);
};

// Get agents user has unlocked
export const getUnlockedAgents = (unlockedIds: string[]): Agent[] => {
  return allAgents.filter(agent => unlockedIds.includes(agent.id));
};