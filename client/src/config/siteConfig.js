/**
 * Global Site & Creator Configuration
 * Update this single file to modify social links, author bio, repository URLs,
 * and contact information across the entire Socratic AI frontend.
 */
export const siteConfig = {
  // ── Creator & Author Details ──
  creator: {
    name: 'Somesh Sinha',
    handle: '@someshsinha',
    tagline: 'Computer Engineering @ I²IT Pune',
    roleBadges: ['Developer', 'Learner', 'Builder'],
    bio: 'I built Socratic AI around a simple problem. Discovering something worth learning is easy, but figuring out how to learn it properly can be much harder. When you start exploring a complex or unfamiliar subject, it is often difficult to find something that gives you enough depth without immediately overwhelming you. Socratic AI is my attempt to make that process easier.',
    avatar: 'https://github.com/someshsinha.png', // Automatically fetches GitHub profile picture
    githubUrl: 'https://github.com/someshsinha',
    linkedinUrl: 'https://www.linkedin.com/in/somesh-sinha-84883424a/',
    email: 'someshsinha902@gmail.com',
    mailtoUrl: 'mailto:someshsinha902@gmail.com',
  },

  // ── Project & External Links ──
  links: {
    githubRepo: 'https://github.com/someshsinha/Socratic-AI',
    githubIssues: 'https://github.com/someshsinha/Socratic-AI/issues',
    docs: '/about',
    about: '/about',
    courses: '/my-courses',
    contact: 'mailto:someshsinha902@gmail.com',
  },

  // ── Platform Brand & Metadata ──
  app: {
    name: 'Socratic AI',
    version: 'v0.1',
    eyebrow: 'Socratic-AI v0.1 // Deep Learning Platform',
    quote: 'To make truly deep learning accessible to anyone, anywhere, by combining the timeless Socratic spirit of questioning with the power of modern AI.',
  },
};

export default siteConfig;
