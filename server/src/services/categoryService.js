import Category from '../models/Category.js';
import slugify from '../utils/slugify.js';

const DEFAULTS = [
  [
    'Web Development',
    'Globe',
    'Frontend, backend and full-stack web skills.',
  ],
  [
    'Frontend Development',
    'Monitor',
    'Build responsive and interactive user interfaces.',
  ],
  [
    'Backend Development',
    'Server',
    'Build APIs, server-side applications and backend services.',
  ],
  [
    'Full Stack Development',
    'Layers',
    'Learn frontend, backend and full-stack application development.',
  ],
  [
    'Programming',
    'Code2',
    'Languages, algorithms and software design.',
  ],
  [
    'Computer Science',
    'Cpu',
    'Explore data structures, algorithms and computer science fundamentals.',
  ],
  [
    'Developer Tools',
    'Wrench',
    'Learn Git, GitHub and essential developer tools.',
  ],
  [
    'Data Science',
    'BarChart3',
    'Analysis, statistics and data storytelling.',
  ],
  [
    'Artificial Intelligence',
    'Brain',
    'Machine learning and applied AI.',
  ],
  [
    'Cybersecurity',
    'ShieldCheck',
    'Protect systems, data and people.',
  ],
  [
    'Database Management',
    'Database',
    'Design, query and operate databases.',
  ],
  [
    'Mobile Development',
    'Smartphone',
    'Build apps for phones and tablets.',
  ],
  [
    'Career Development',
    'Briefcase',
    'Interviews, communication and professional growth.',
  ],
];

export async function ensureDefaultCategories() {
  for (const [order, [name, icon, description]] of DEFAULTS.entries()) {
    const slug = slugify(name);

    await Category.findOneAndUpdate(
      { name },
      {
        $setOnInsert: {
          name,
          slug,
          icon,
          description,
          order,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  console.log('Default categories verified successfully.');
}