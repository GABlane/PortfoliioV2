import type { PortfolioCategory } from '@/types/portfolio';

export const categories: PortfolioCategory[] = [
  {
    id: 'profile',
    label: 'Profile',
    iconType: 'profile',
    items: [
      {
        id: 'about',
        title: 'About Me',
        subtitle: 'Aspiring Software Engineer',
        description:
          'Computer Science student at the University of Caloocan City building real-world systems — from IoT ecosystems to full-stack web apps. Based in Caloocan City, Philippines.',
        meta: 'Caloocan City, PH · BSCS 2023–Present',
      },
      {
        id: 'philosophy',
        title: 'Philosophy',
        subtitle: 'How I Work',
        description:
          'Disciplined and driven by consistency rather than fleeting inspiration. I believe reliable systems and clean code come from sustained, deliberate effort.',
      },
      {
        id: 'achievements',
        title: 'Achievements',
        subtitle: 'Honors & Recognition',
        description:
          '1st Place in the University of Caloocan C Programming Competition (Feb 2023). Passed TESDA Call Center NC II Training (Jan 2024). BSCS Representative for the Department of Liberal Arts and Sciences.',
        meta: 'C Programming · TESDA NC II · Student Gov',
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
        title: 'MotoMedic IMS',
        subtitle: 'Inventory & POS System',
        description:
          'Centralized POS and inventory system for a local repair shop. Architected the backend, designed a normalized ERD, documented RESTful APIs with Swagger, and integrated Google OAuth for role-based auth.',
        meta: 'Laravel · MySQL · Swagger · Google OAuth',
        ctaLabel: 'GitHub',
        ctaHref: 'https://github.com/99lash/pacadaworkz-motomedic-ims-app',
      },
      {
        id: 'smartvault',
        title: 'SmartVault IoT',
        subtitle: 'IoT Ecosystem',
        description:
          'High-security smart vault with 2FA locking and anti-tamper detection. Built a React Native mobile app for real-time monitoring and engineered the FastAPI/Uvicorn backend for low-latency IoT communication.',
        meta: 'React Native · Python · FastAPI · SQLite',
        ctaLabel: 'GitHub',
        ctaHref: 'https://github.com/XpnsiveSharks/smartvault-app',
      },
      {
        id: 'gearfalcon',
        title: 'GearFalcon',
        subtitle: 'E-Commerce Platform',
        description:
          'Full-stack e-commerce platform with a Next.js + TypeScript frontend and PHP backend. Gained deep experience in complex state management across a modern web architecture and database normalization.',
        meta: 'Next.js · TypeScript · PHP · MySQL',
        ctaLabel: 'GitHub',
        ctaHref: 'https://github.com/XpnsiveSharks/gearfalcon-frontend',
      },
      {
        id: 'java-game',
        title: 'OOP Case Study Game',
        subtitle: 'Desktop Game',
        description:
          'Desktop game implementing the Four Pillars of OOP — Encapsulation, Inheritance, Polymorphism, and Abstraction. GUI built with Java Swing for an interactive experience.',
        meta: 'Java · Java Swing · OOP',
        ctaLabel: 'GitHub',
        ctaHref: 'https://github.com/GABlane/Case-Study-Game',
      },
      {
        id: 'bagyoalerto',
        title: 'BagyoAlerto',
        subtitle: 'Hackathon Project',
        description:
          'Community-focused web app built during a hackathon to deliver emergency checklists and safety protocols for typhoon-prone areas. Optimized for responsive design and fast load times.',
        meta: 'Vanilla JS · HTML5 · CSS3',
        ctaLabel: 'GitHub',
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
        title: 'Languages',
        subtitle: 'TypeScript · JavaScript · Java · PHP · Kotlin · C#',
        description:
          'Polyglot across the stack. TypeScript and JavaScript for web, Java and Kotlin for OOP and Android-adjacent work, PHP for backend systems, C# for desktop and game tooling.',
      },
      {
        id: 'frontend',
        title: 'Frontend',
        subtitle: 'React · Next.js · React Native · Redux · Vite · Tailwind',
        description:
          'Building web and mobile interfaces from scratch — SPA to SSR, component libraries to cross-platform Expo apps. Comfortable with Redux state management and modern build tooling.',
      },
      {
        id: 'backend',
        title: 'Backend',
        subtitle: 'Node.js · NestJS · Express · FastAPI · Laravel',
        description:
          'REST API design across multiple frameworks and runtimes. Node/Express for lightweight services, NestJS for structured architectures, FastAPI for IoT/Python backends, Laravel for PHP MVC systems.',
      },
      {
        id: 'database',
        title: 'Database',
        subtitle: 'PostgreSQL · MySQL · MongoDB · SQLite · Firebase',
        description:
          'Relational database design with normalized ERDs and parameterized queries. MongoDB for document stores, Firebase for real-time and auth, SQLite for embedded and mobile data.',
      },
      {
        id: 'devops',
        title: 'DevOps & Tools',
        subtitle: 'Git · Docker · Vercel · Postman · Swagger · Arduino',
        description:
          'Full lifecycle from local dev to deployment. Docker for containerization, Vercel/Netlify/Firebase for hosting, Postman and Swagger for API documentation, Arduino for IoT hardware integration.',
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
        title: 'BS Computer Science',
        subtitle: 'University of Caloocan City · 2023–Present',
        description:
          'Currently pursuing a BSCS degree with focus on software engineering. Active in competitive programming and building production-grade systems as academic projects.',
        meta: 'Caloocan City · Full-time Student',
      },
      {
        id: 'shs',
        title: 'Senior High School',
        subtitle: 'System Plus Computer College · 2020–2023',
        description:
          'Completed Senior High School with a tech track at System Plus Computer College. Foundation in programming and IT fundamentals.',
        meta: 'Caloocan City',
      },
      {
        id: 'bscs-rep',
        title: 'BSCS Representative',
        subtitle: 'Dept. of Liberal Arts & Sciences · 2023–2025',
        description:
          'Elected student representative for the BSCS program within the CLAS department. Bridging student concerns and academic governance.',
        meta: 'University of Caloocan City',
      },
      {
        id: 'orgs',
        title: 'Organizations',
        subtitle: 'MIS · ACES · 2023–2026',
        description:
          'Active member of the Management Information System (MIS) and Association of Computer E-Students (ACES) organizations — participating in tech events, workshops, and community initiatives.',
        meta: 'University of Caloocan City',
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
        title: 'Email',
        subtitle: 'Direct Line',
        description: 'johngabrielleofiangga@gmail.com',
        ctaLabel: 'Send Email',
        ctaHref: 'mailto:johngabrielleofiangga@gmail.com',
      },
      {
        id: 'github',
        title: 'GitHub',
        subtitle: 'Projects & Source Code',
        description:
          'Personal projects, academic work, and team collaborations across GABlane, 99lash, and XpnsiveSharks.',
        ctaLabel: 'View Profile',
        ctaHref: 'https://github.com/GABlane',
      },
      {
        id: 'linkedin',
        title: 'LinkedIn',
        subtitle: 'Professional Network',
        description:
          'Career profile, education history, and professional connections.',
        ctaLabel: 'Connect',
        ctaHref: 'https://linkedin.com/in/john-gabrielle-ofiangga-b53356334',
      },
      {
        id: 'phone',
        title: 'Phone',
        subtitle: 'Mobile · Philippines',
        description: '+63 995-726-9441',
        ctaLabel: 'Call / SMS',
        ctaHref: 'tel:+639957269441',
      },
    ],
  },
];
