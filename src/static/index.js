export const roles = [
  "Full Stack Developer",
  "React.js | Next.js | Native",
  "Node.js | Express | MongoDB",
];

export const skills = [
  "React",
  "Next.js",
  "React Native",
  "Redux",
  "Typescript",
  "JavaScript",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "MaterialUI",
  "Antd",
  "Node.js",
  "Express",
  "MongoDB",
  "SQL",
  "NoSQL",
  "Puppeteer",
  "N8N",
  "SEO",
  "NPM",
  "Data Structures and Algorithms",
  "AWS",
];

export const skillsGrouped = [
  {
    id: "frontend",
    label: "Frontend",
    items: [
      { name: "React", level: "Advanced" },
      { name: "Next.js", level: "Advanced" },
      { name: "Redux", level: "Advanced" },
      { name: "TypeScript", level: "Advanced" },
      { name: "JavaScript", level: "Advanced" },
      { name: "HTML", level: "Advanced" },
      { name: "CSS", level: "Advanced" },
      { name: "Tailwind CSS", level: "Advanced" },
      { name: "MaterialUI", level: "Advanced" },
      { name: "Antd", level: "Intermediate" },
      { name: "SEO", level: "Intermediate" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    items: [
      { name: "Node.js", level: "Advanced" },
      { name: "Express", level: "Advanced" },
      { name: "Puppeteer", level: "Intermediate" },
      { name: "N8N", level: "Intermediate" },
    ],
  },
  {
    id: "data",
    label: "Data & DB",
    items: [
      { name: "MongoDB", level: "Advanced" },
      { name: "SQL", level: "Intermediate" },
      { name: "NoSQL", level: "Intermediate" },
      { name: "DSA", level: "Advanced" },
      { name: "AWS", level: "Intermediate" },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    items: [
      { name: "GitHub", level: "Advanced" },
      { name: "GitLab", level: "Advanced" },
      { name: "NPM", level: "Advanced" },
      { name: "Jira", level: "Intermediate" },
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    items: [
      { name: "React Native", level: "Advanced" },
      { name: 'Expo', level: 'Advanced'},
      { name: 'GlueStack', level: 'Intermediate'},
      { name: "Native Base", level: "Intermediate"},
    ],
  },
  {
    id: "map",
    label: "Map",
    items: [
      { name: "ArcGIS", level: "Advanced" },
      { name: "Native Maps", level: "Intermediate" },
      { name: "Mapbox", level: "Intermediate" },
      { name: "Google Maps", level: "Advanced" },
    ],
  },
];

export const aboutTabs = [
  {
    id: "experience",
    label: "Experience",
    items: [
      {
        period: "Nov 2023 - Present",
        title: "Full Stack Developer",
        organization: "Inspiron Labs",
        location: "Bangalore, Karnataka",
        highlights: [
          "Built end-to-end product features from backend logic to performant front-end UI.",
          "Scaled pricing modules to handle real-time optimization signals.",
          "Developed with React, Next.js, Core JavaScript, and Node.js ensuring reliability.",
          "Led key features, made architectural decisions, and mentored junior developers.",
          "Improved team efficiency through best practices in coding, testing, and deployment.",
        ],
      },
    ],
  },
  {
    id: "education",
    label: "Education",
    items: [
      {
        period: "Nov 2022 – Oct 2023",
        title: "Full Stack Development, Information Technology",
        organization: "Masai",
        location: "",
        highlights: ["GPA: A+"],
      },
    ],
  },
];

export const recommendations = [
  {
    id: 1,
    name: "Sonu Shettiyar",
    title: "Brand Evangelist @ Masai | Building Price Perfect AI | Ex-Accelgrowth",
    relationship: "Studied together at Masai School",
    date: "November 8, 2025",
    content: "Sourav always stood out as one of the sharpest minds in the room. His problem-solving skills and coding abilities are exceptional, and he consistently delivered elegant solutions that impressed everyone. What truly sets him apart is his curiosity, drive for improvement, and refusal to settle for average. His level of maturity and technical depth at a young age is inspiring. Any team would be fortunate to have someone with his talent, focus, and positive attitude.",
    avatar: "SS",
    color: "#ff6b6b"
  },
  {
    id: 2,
    name: "Manoj Kumar Nishad",
    title: "Senior Frontend Developer – React.js, Next.js, TypeScript, Redux Toolkit, Tailwind CSS",
    relationship: "Worked together on the same team",
    date: "November 8, 2025",
    content: "I had the pleasure of working with Sourav Samanta, a dedicated and talented frontend developer. He is passionate about creating innovative solutions and consistently delivers high-quality work. A great team player and a true asset to any project.",
    avatar: "MN",
    color: "#4ecdc4"
  },
  {
    id: 3,
    name: "Sagar Eknath Bangade",
    title: "Software Engineer @ InspironLabs | GenAI | MERN | Java Spring Boot | React Native",
    relationship: "Reported directly to Sourav",
    date: "November 7, 2025",
    content: "Working closely with Sourav was a great experience. He is one of the most reliable and composed people I've worked with. Always focused, quick to help, and never afraid to tackle tough problems. A solid teammate and a great person to have on any project.",
    avatar: "SB",
    color: "#45b7d1"
  }
];