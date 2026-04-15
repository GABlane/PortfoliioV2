import type { PortfolioCategory } from '@/types/portfolio';

export const categories: PortfolioCategory[] = [
  {
    id: 'profile',
    label: 'Profile',
    iconType: 'profile',
    items: [
      {
        id: 'about',
        icon: 'user' as const,
        title: 'About Me',
        subtitle: 'Aspiring Software Engineer',
        description:
          'Computer Science student at the University of Caloocan City building real-world systems — from IoT ecosystems to full-stack web apps. Based in Caloocan City, Philippines.',
        tags: ['Caloocan City, PH', 'BSCS 2023–Present'],
      },
      {
        id: 'philosophy',
        icon: 'lightbulb' as const,
        title: 'Philosophy',
        subtitle: 'How I Work',
        description:
          'Disciplined and driven by consistency rather than fleeting inspiration. I believe reliable systems and clean code come from sustained, deliberate effort.',
      },
      {
        id: 'achievements',
        icon: 'trophy' as const,
        title: 'Achievements',
        subtitle: 'Honors & Recognition',
        description:
          '1st Place in the University of Caloocan C Programming Competition (Feb 2023). Passed TESDA Call Center NC II Training (Jan 2024). BSCS Representative for the Department of Liberal Arts and Sciences.',
        tags: ['C Programming', 'TESDA NC II', 'Student Gov'],
      },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    iconType: 'projects',
    items: [
      {
        id: 'motomedic',
        icon: 'store' as const,
        title: 'MotoMedic IMS',
        subtitle: 'Inventory & POS System',
        description:
          'Centralized POS and inventory system for a local repair shop. Architected the backend, designed a normalized ERD, documented RESTful APIs with Swagger, and integrated Google OAuth for role-based auth.',
        tags: ['Laravel', 'MySQL', 'Swagger', 'Google OAuth'],
        image: 'placeholder',
        ctaLabel: 'View on GitHub',
        ctaHref: 'https://github.com/99lash/pacadaworkz-motomedic-ims-app',
      },
      {
        id: 'smartvault',
        icon: 'shield' as const,
        title: 'SmartVault IoT',
        subtitle: 'IoT Ecosystem',
        description:
          'High-security smart vault with 2FA locking and anti-tamper detection. Built a React Native mobile app for real-time monitoring and engineered the FastAPI/Uvicorn backend for low-latency IoT communication.',
        tags: ['React Native', 'Python', 'FastAPI', 'SQLite'],
        image: 'placeholder',
        ctaLabel: 'View on GitHub',
        ctaHref: 'https://github.com/XpnsiveSharks/smartvault-app',
      },
      {
        id: 'gearfalcon',
        icon: 'cart' as const,
        title: 'GearFalcon',
        subtitle: 'E-Commerce Platform',
        description:
          'Full-stack e-commerce platform with a Next.js + TypeScript frontend and PHP backend. Gained deep experience in complex state management across a modern web architecture and database normalization.',
        tags: ['Next.js', 'TypeScript', 'PHP', 'MySQL'],
        image: 'placeholder',
        ctaLabel: 'View on GitHub',
        ctaHref: 'https://github.com/XpnsiveSharks/gearfalcon-frontend',
      },
      {
        id: 'java-game',
        icon: 'gamepad' as const,
        title: 'OOP Case Study Game',
        subtitle: 'Desktop Game',
        description:
          'Desktop game implementing the Four Pillars of OOP — Encapsulation, Inheritance, Polymorphism, and Abstraction. GUI built with Java Swing for an interactive experience.',
        tags: ['Java', 'Java Swing', 'OOP'],
        image: 'placeholder',
        ctaLabel: 'View on GitHub',
        ctaHref: 'https://github.com/GABlane/Case-Study-Game',
      },
      {
        id: 'bagyoalerto',
        icon: 'alert' as const,
        title: 'BagyoAlerto',
        subtitle: 'Hackathon Project',
        description:
          'Community-focused web app built during a hackathon to deliver emergency checklists and safety protocols for typhoon-prone areas. Optimized for responsive design and fast load times.',
        tags: ['Vanilla JS', 'HTML5', 'CSS3'],
        image: 'placeholder',
        ctaLabel: 'View on GitHub',
        ctaHref: 'https://github.com/99lash/BagyoAlerto',
      },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    iconType: 'skills',
    items: [
      {
        id: 'languages',
        icon: 'code' as const,
        title: 'Languages',
        subtitle: 'Core programming languages',
        description:
          'Polyglot across the stack. TypeScript and JavaScript for web, Java and Kotlin for OOP and Android-adjacent work, PHP for backend systems, C# for desktop and game tooling.',
        tags: ['TypeScript', 'JavaScript', 'Java', 'PHP', 'Kotlin', 'C#'],
      },
      {
        id: 'frontend',
        icon: 'monitor' as const,
        title: 'Frontend',
        subtitle: 'UI frameworks & tooling',
        description:
          'Building web and mobile interfaces from scratch — SPA to SSR, component libraries to cross-platform Expo apps. Comfortable with Redux state management and modern build tooling.',
        tags: ['React', 'Next.js', 'React Native', 'Redux', 'Vite', 'Tailwind'],
      },
      {
        id: 'backend',
        icon: 'server' as const,
        title: 'Backend',
        subtitle: 'Server frameworks & APIs',
        description:
          'REST API design across multiple frameworks and runtimes. Node/Express for lightweight services, NestJS for structured architectures, FastAPI for IoT/Python backends, Laravel for PHP MVC systems.',
        tags: ['Node.js', 'NestJS', 'Express', 'FastAPI', 'Laravel'],
      },
      {
        id: 'database',
        icon: 'database' as const,
        title: 'Database',
        subtitle: 'Data stores & modeling',
        description:
          'Relational database design with normalized ERDs and parameterized queries. MongoDB for document stores, Firebase for real-time and auth, SQLite for embedded and mobile data.',
        tags: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Firebase'],
      },
      {
        id: 'devops',
        icon: 'wrench' as const,
        title: 'DevOps & Tools',
        subtitle: 'Build, deploy & integrate',
        description:
          'Full lifecycle from local dev to deployment. Docker for containerization, Vercel/Netlify/Firebase for hosting, Postman and Swagger for API documentation, Arduino for IoT hardware integration.',
        tags: ['Git', 'Docker', 'Vercel', 'Postman', 'Swagger', 'Arduino'],
      },
    ],
  },
  {
    id: 'experience',
    label: 'Experience',
    iconType: 'experience',
    items: [
      {
        id: 'ucc',
        icon: 'graduation' as const,
        title: 'BS Computer Science',
        subtitle: 'University of Caloocan City · 2023–Present',
        description:
          'Currently pursuing a BSCS degree with focus on software engineering. Active in competitive programming and building production-grade systems as academic projects.',
        tags: ['Caloocan City', 'Full-time Student'],
      },
      {
        id: 'shs',
        icon: 'book' as const,
        title: 'Senior High School',
        subtitle: 'System Plus Computer College · 2020–2023',
        description:
          'Completed Senior High School with a tech track at System Plus Computer College. Foundation in programming and IT fundamentals.',
        tags: ['Caloocan City'],
      },
      {
        id: 'bscs-rep',
        icon: 'flag' as const,
        title: 'BSCS Representative',
        subtitle: 'Dept. of Liberal Arts & Sciences · 2023–2025',
        description:
          'Elected student representative for the BSCS program within the CLAS department. Bridging student concerns and academic governance.',
        tags: ['University of Caloocan City'],
      },
      {
        id: 'orgs',
        icon: 'users' as const,
        title: 'Organizations',
        subtitle: 'MIS · ACES · 2023–2026',
        description:
          'Active member of the Management Information System (MIS) and Association of Computer E-Students (ACES) organizations — participating in tech events, workshops, and community initiatives.',
        tags: ['University of Caloocan City'],
      },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    iconType: 'contact',
    items: [
      {
        id: 'email',
        icon: 'mail' as const,
        title: 'Email',
        subtitle: 'Direct Line',
        description: 'johngabrielleofiangga@gmail.com',
        ctaLabel: 'Send Email',
        ctaHref: 'mailto:johngabrielleofiangga@gmail.com',
      },
      {
        id: 'github',
        icon: 'github' as const,
        title: 'GitHub',
        subtitle: 'Projects & Source Code',
        description:
          'Personal projects, academic work, and team collaborations across GABlane, 99lash, and XpnsiveSharks.',
        ctaLabel: 'View Profile',
        ctaHref: 'https://github.com/GABlane',
      },
      {
        id: 'linkedin',
        icon: 'linkedin' as const,
        title: 'LinkedIn',
        subtitle: 'Professional Network',
        description:
          'Career profile, education history, and professional connections.',
        ctaLabel: 'Connect',
        ctaHref: 'https://linkedin.com/in/john-gabrielle-ofiangga-b53356334',
      },
      {
        id: 'phone',
        icon: 'phone' as const,
        title: 'Phone',
        subtitle: 'Mobile · Philippines',
        description: '+63 995-726-9441',
        ctaLabel: 'Call / SMS',
        ctaHref: 'tel:+639957269441',
      },
    ],
  },
];
