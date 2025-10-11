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

  // Discovery & Research Agents (Blue Family)
  {
    id: 'market-scanner',
    name: 'Market Scan Agent',
    specialty: 'Competitive Intelligence',
    avatar: '/api/placeholder/64/64?text=MS',
    backstory: 'Specialized AI that summarizes competitor features, reviews, and benchmarks in real-time. Constantly monitors market trends and competitive landscapes.',
    capabilities: ['Competitor Analysis', 'Feature Benchmarking', 'Market Research', 'Review Synthesis'],
    tags: ['Research', 'Competitive', 'Analysis', 'Intelligence'],
    xpRequired: 100,
    familyColor: 'blue'
  },
  {
    id: 'user-insight',
    name: 'User Insight Agent',
    specialty: 'User Research Synthesis',
    avatar: '/api/placeholder/64/64?text=UI',
    backstory: 'Expert at synthesizing interview transcripts and survey data into actionable patterns, pain points, and Jobs-to-be-Done insights.',
    capabilities: ['Interview Analysis', 'Survey Synthesis', 'Pain Point Identification', 'JTBD Framework'],
    tags: ['User Research', 'Insights', 'JTBD', 'Synthesis'],
    xpRequired: 150,
    familyColor: 'blue'
  },
  {
    id: 'trends-radar',
    name: 'Trends Radar',
    specialty: 'Industry Intelligence',
    avatar: '/api/placeholder/64/64?text=TR',
    backstory: 'Surfaces relevant industry news, patents, and open-source projects aligned with your product space. Your crystal ball for what\'s coming next.',
    capabilities: ['Trend Analysis', 'Patent Research', 'Open Source Tracking', 'Industry News'],
    tags: ['Trends', 'Innovation', 'Patents', 'Open Source'],
    xpRequired: 200,
    familyColor: 'blue'
  },

  // Prioritization & Strategy Agents (Blue Family)
  {
    id: 'impact-effort-plotter',
    name: 'Impact vs Effort Auto-Plotter',
    specialty: 'Priority Matrix Analysis',
    avatar: '/api/placeholder/64/64?text=IE',
    backstory: 'Given your backlog items, automatically generates impact vs effort charts and provides recommended priority ordering with data-driven rationale.',
    capabilities: ['Impact Analysis', 'Effort Estimation', 'Priority Scoring', 'Decision Matrix'],
    tags: ['Prioritization', 'Analysis', 'Strategy', 'Decision Making'],
    xpRequired: 250,
    familyColor: 'blue'
  },
  {
    id: 'scenario-simulator',
    name: 'Scenario Simulator',
    specialty: 'What-If Analysis',
    avatar: '/api/placeholder/64/64?text=SS',
    backstory: 'Models cost/benefit impacts of timeline changes. Ask "What if we delay Feature A by 2 sprints?" and get detailed impact analysis.',
    capabilities: ['Scenario Modeling', 'Impact Simulation', 'Timeline Analysis', 'Resource Planning'],
    tags: ['Simulation', 'Planning', 'Analysis', 'Strategy'],
    xpRequired: 300,
    familyColor: 'blue'
  },

  // Backlog & Workflow Agents (Green Family)
  {
    id: 'story-writer',
    name: 'Story Writer',
    specialty: 'User Story Creation',
    avatar: '/api/placeholder/64/64?text=SW',
    backstory: 'Transforms feature ideas into fully-formed user stories with acceptance criteria, edge cases, and technical considerations.',
    capabilities: ['User Story Writing', 'Acceptance Criteria', 'Edge Case Analysis', 'Story Splitting'],
    tags: ['Agile', 'Stories', 'Requirements', 'Documentation'],
    xpRequired: 120,
    familyColor: 'green'
  },
  {
    id: 'refinement-assistant',
    name: 'Refinement Assistant',
    specialty: 'Epic Decomposition',
    avatar: '/api/placeholder/64/64?text=RA',
    backstory: 'Suggests splitting oversized epics into manageable, deliverable slices while maintaining value delivery and technical coherence.',
    capabilities: ['Epic Splitting', 'Story Decomposition', 'Value Slicing', 'Backlog Refinement'],
    tags: ['Refinement', 'Planning', 'Decomposition', 'Value'],
    xpRequired: 180,
    familyColor: 'green'
  },

  // Metrics & Reporting Agents (Orange Family)
  {
    id: 'auto-kpi-dashboard',
    name: 'Auto-KPI Dashboard',
    specialty: 'Analytics Intelligence',
    avatar: '/api/placeholder/64/64?text=KPI',
    backstory: 'Pulls from product analytics platforms (Mixpanel, GA, Amplitude) and suggests insights like conversion drop-offs and adoption curves.',
    capabilities: ['KPI Tracking', 'Analytics Integration', 'Insight Generation', 'Performance Monitoring'],
    tags: ['Analytics', 'KPIs', 'Dashboards', 'Insights'],
    xpRequired: 220,
    familyColor: 'orange'
  },
  {
    id: 'experiment-tracker',
    name: 'Experiment Tracker',
    specialty: 'A/B Test Analysis',
    avatar: '/api/placeholder/64/64?text=ET',
    backstory: 'Logs A/B tests, interprets results statistically, and generates clear recommendations: ship, hold, or iterate.',
    capabilities: ['A/B Test Design', 'Statistical Analysis', 'Result Interpretation', 'Recommendation Engine'],
    tags: ['Experimentation', 'Statistics', 'Testing', 'Analysis'],
    xpRequired: 280,
    familyColor: 'orange'
  },
  {
    id: 'outcome-analyzer',
    name: 'Outcome vs Output Analyzer',
    specialty: 'Impact Measurement',
    avatar: '/api/placeholder/64/64?text=OA',
    backstory: 'Reminds PMs when they\'re shipping lots of features but not moving north-star metrics. Keeps you focused on outcomes.',
    capabilities: ['Outcome Tracking', 'Impact Analysis', 'Metric Correlation', 'Strategic Alignment'],
    tags: ['Outcomes', 'Impact', 'Strategy', 'Metrics'],
    xpRequired: 350,
    familyColor: 'orange'
  },

  // Team & Stakeholder Alignment Agents (Green Family)
  {
    id: 'brief-generator',
    name: 'One-Click Brief Generator',
    specialty: 'Communication Automation',
    avatar: '/api/placeholder/64/64?text=BG',
    backstory: 'Generates concise stakeholder updates, investor memos, and sprint summaries from your product data and recent activities.',
    capabilities: ['Brief Generation', 'Stakeholder Communication', 'Status Updates', 'Executive Summaries'],
    tags: ['Communication', 'Reporting', 'Stakeholders', 'Documentation'],
    xpRequired: 160,
    familyColor: 'green'
  },
  {
    id: 'meeting-summarizer',
    name: 'Meeting Summarizer',
    specialty: 'Action Item Extraction',
    avatar: '/api/placeholder/64/64?text=MS2',
    backstory: 'Turns product reviews and meetings into organized action lists, tagged by squad and priority level.',
    capabilities: ['Meeting Transcription', 'Action Item Extraction', 'Task Assignment', 'Follow-up Tracking'],
    tags: ['Meetings', 'Organization', 'Action Items', 'Productivity'],
    xpRequired: 190,
    familyColor: 'green'
  },
  {
    id: 'roadmap-visualizer',
    name: 'Roadmap Visualizer',
    specialty: 'Strategic Planning',
    avatar: '/api/placeholder/64/64?text=RV',
    backstory: 'Builds dynamic roadmaps (timeline or now/next/later format) based on your backlog priorities and strategic goals.',
    capabilities: ['Roadmap Generation', 'Strategic Planning', 'Timeline Visualization', 'Priority Mapping'],
    tags: ['Roadmaps', 'Planning', 'Strategy', 'Visualization'],
    xpRequired: 320,
    familyColor: 'green'
  },

  // Specialized High-Level Agents
  {
    id: 'growth-hacker-ai',
    name: 'Growth Hacker AI',
    specialty: 'Advanced Growth Strategy',
    avatar: '/api/placeholder/64/64?text=GH',
    backstory: 'Unlockable specialist focused on viral loops, retention mechanics, and scaling strategies. Appears after hitting growth milestones.',
    capabilities: ['Viral Mechanics', 'Retention Strategy', 'Growth Loops', 'Scaling Tactics'],
    tags: ['Growth', 'Viral', 'Retention', 'Advanced'],
    xpRequired: 500,
    familyColor: 'orange'
  },
  {
    id: 'vision-strategist',
    name: 'Vision Strategist AI',
    specialty: 'Strategic Vision',
    avatar: '/api/placeholder/64/64?text=VS2',
    backstory: 'Unlockable specialist for long-term product vision and market positioning. Helps define your product\'s future direction.',
    capabilities: ['Vision Creation', 'Market Positioning', 'Strategic Planning', 'Innovation Strategy'],
    tags: ['Vision', 'Strategy', 'Innovation', 'Leadership'],
    xpRequired: 800,
    familyColor: 'blue'
  },

  // Technical Specialists
  {
    id: 'sophia-ai',
    name: 'Dr. Sophia Chen',
    specialty: 'AI/ML Engineer',
    avatar: '/api/placeholder/64/64?text=SC2',
    backstory: 'AI researcher with PhD from Stanford. Expert in machine learning, natural language processing, and computer vision applications.',
    capabilities: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
    tags: ['AI', 'ML', 'Python', 'Research'],
    xpRequired: 600,
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
    xpRequired: 700,
    familyColor: 'purple'
  },
  {
    id: 'gabriel-architect',
    name: 'Gabriel Santos',
    specialty: 'Solution Architect',
    avatar: '/api/placeholder/64/64?text=GS',
    backstory: 'Enterprise architecture specialist with expertise in system design and scalable solutions. Former principal architect at Amazon Web Services.',
    capabilities: ['System Architecture', 'Scalability Design', 'Technology Strategy', 'Enterprise Integration'],
    tags: ['Architecture', 'Scalability', 'Enterprise', 'Cloud'],
    xpRequired: 900,
    familyColor: 'purple'
  },
  {
    id: 'isabella-data',
    name: 'Isabella Rodriguez',
    specialty: 'Chief Data Officer',
    avatar: '/api/placeholder/64/64?text=IR',
    backstory: 'Data science leader with experience building data platforms at Netflix and Spotify. Expert in AI strategy and data governance.',
    capabilities: ['Data Strategy', 'AI Implementation', 'Data Governance', 'Advanced Analytics'],
    tags: ['Data Science', 'AI Strategy', 'Analytics', 'Leadership'],
    xpRequired: 1000,
    familyColor: 'blue'
  },
  {
    id: 'maximilian-cto',
    name: 'Maximilian Weber',
    specialty: 'Chief Technology Officer',
    avatar: '/api/placeholder/64/64?text=MW',
    backstory: 'Technology visionary with 15+ years leading engineering teams. Former CTO at unicorn startups, expert in scaling technology organizations.',
    capabilities: ['Technology Leadership', 'Engineering Management', 'Innovation Strategy', 'Team Scaling'],
    tags: ['CTO', 'Leadership', 'Innovation', 'Engineering'],
    xpRequired: 1200,
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
  name: 'Yassine AQEJJAJ',
  role: 'Product Manager',
  level: 8,
  xp: 1200,
  streak: 12,
  coins: 560,
  unlockedAgents: [
    'sarah-pm', 'alex-ux', 'david-fullstack', 'zoe-frontend', 'emma-growth', 'maya-ui', 'carlos-content',
    'market-scanner', 'user-insight', 'story-writer', 'auto-kpi-dashboard', 'brief-generator', 'experiment-tracker',
    'impact-effort-plotter', 'refinement-assistant', 'meeting-summarizer', 'trends-radar', 'scenario-simulator',
    'outcome-analyzer', 'roadmap-visualizer', 'growth-hacker-ai', 'vision-strategist'
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