// Development seed: creates demo users, categories, courses, lessons and quizzes. Safe to re-run (it skips what exists).
// Demo passwords below are for LOCAL DEVELOPMENT ONLY. The script refuses to run in production unless ALLOW_SEED=true.
import env from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Course from '../src/models/Course.js';
import Category from '../src/models/Category.js';
import Section from '../src/models/Section.js';
import Lesson from '../src/models/Lesson.js';
import Quiz from '../src/models/Quiz.js';
import { ensureDefaultCategories } from '../src/services/categoryService.js';
import { refreshCourseCounters } from '../src/services/courseService.js';
import { parseYouTubeUrl } from '../src/utils/youtube.js';

if (env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
  console.error('Refusing to seed demo data in production. Set ALLOW_SEED=true if you really mean it.');
  process.exit(1);
}

const DEMO_PASSWORD = 'Demo@12345';
const users = [
  { name: 'Demo Admin', email: 'admin@learnsphere.dev', role: 'admin' },
  { name: 'Demo Instructor', email: 'instructor@learnsphere.dev', role: 'instructor', headline: 'Sample instructor account' },
  { name: 'Demo Student', email: 'student@learnsphere.dev', role: 'student' },
];

// These are public freeCodeCamp.org videos that, to the best of our knowledge, allow embedding. They could not be
// re-checked from the build environment, so confirm each plays and swap in your own links from the lesson editor.
const VIDEOS = {
  // JavaScript
  js: 'https://youtu.be/hKB-YGF14SY',

  // Python
  python: 'https://youtu.be/UrsmFxEIp5k',

  // SQL
  sql: 'https://youtu.be/hlGoQC332VM',

  // HTML and CSS
  htmlCss: 'https://youtu.be/HcOc7P5BMi4',

  // React
  react: 'https://www.youtube.com/watch?v=SqcY0GlETPk',

  // Node.js
  node: 'https://www.youtube.com/watch?v=Oe421EPjeBE',

  // MongoDB
  mongodb: 'https://www.youtube.com/watch?v=c2M-rlkkT5o',

  // MERN Stack
  mern: 'https://www.youtube.com/watch?v=O3BUHwfHf84',

  // Data Structures and Algorithms
  dsa: 'https://www.youtube.com/watch?v=8hly31xKli0',

  // Java
  java: 'https://www.youtube.com/watch?v=eIrMbAQSU34',

  // Git and GitHub
  git: 'https://www.youtube.com/watch?v=RGOj5yH7evk',

  // REST API
  api: 'https://www.youtube.com/watch?v=VywxIQ2ZXw4',

  // Web Security
  security: 'https://www.youtube.com/watch?v=Uu2aQ1s7q3M',

  // TypeScript
  typescript: 'https://www.youtube.com/watch?v=30LWjhZzg50',

  // Data Analytics
  dataAnalytics: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
};
const courses = [
  // 1. JavaScript Foundations
  {
    title: 'JavaScript Foundations',
    category: 'Web Development',
    level: 'beginner',
    video: VIDEOS.js,
    price: 0,
    description:
      'Learn JavaScript fundamentals, variables, functions, arrays, objects, DOM manipulation, and modern ES6+ features.',
    objectives: [
      'Understand JavaScript variables and data types',
      'Work with arrays, objects, and functions',
      'Understand DOM manipulation and events',
      'Use modern ES6+ syntax',
    ],
    sections: [
      ['Getting Started', ['Introduction to JavaScript', 'Variables and Data Types', 'Operators']],
      ['Core Concepts', ['Conditions and Loops', 'Functions and Scope', 'Arrays and Objects']],
      ['Browser JavaScript', ['DOM Manipulation', 'Events', 'ES6+ Features']],
    ],
    quiz: {
      title: 'JavaScript Foundations Quiz',
      questions: [
        {
          prompt: 'Which keyword declares a block-scoped variable that can change?',
          options: ['var', 'let', 'const'],
          correctIndex: 1,
          explanation: 'let declares a block-scoped variable that can be reassigned.',
        },
        {
          prompt: 'What does typeof [] return?',
          options: ['array', 'object', 'list'],
          correctIndex: 1,
          explanation: 'JavaScript arrays are objects, so typeof [] returns "object".',
        },
        {
          prompt: 'Which method adds an element to the end of an array?',
          options: ['push()', 'shift()', 'unshift()'],
          correctIndex: 0,
          explanation: 'push() adds one or more elements to the end of an array.',
        },
      ],
    },
  },

  // 2. Python for Beginners
  {
    title: 'Python for Beginners',
    category: 'Programming',
    level: 'beginner',
    video: VIDEOS.python,
    price: 0,
    description:
      'Start programming with Python and learn syntax, variables, loops, functions, collections, and basic problem-solving.',
    objectives: [
      'Write and execute Python programs',
      'Understand variables and data types',
      'Use lists, tuples, sets, and dictionaries',
      'Create functions and solve basic problems',
    ],
    sections: [
      ['Python Basics', ['Introduction to Python', 'Variables and Data Types', 'Input and Output']],
      ['Control Flow', ['If-Else Statements', 'For and While Loops', 'Break and Continue']],
      ['Data Structures', ['Lists and Tuples', 'Sets and Dictionaries', 'Functions']],
    ],
    quiz: {
      title: 'Python Basics Quiz',
      questions: [
        {
          prompt: 'Which symbol starts a single-line comment in Python?',
          options: ['//', '#', '--'],
          correctIndex: 1,
          explanation: 'Python uses # to begin a single-line comment.',
        },
        {
          prompt: 'Which data structure stores key-value pairs?',
          options: ['list', 'tuple', 'dict'],
          correctIndex: 2,
          explanation: 'A dictionary stores data as key-value pairs.',
        },
        {
          prompt: 'Which keyword defines a function in Python?',
          options: ['function', 'def', 'func'],
          correctIndex: 1,
          explanation: 'Python uses the def keyword to define functions.',
        },
      ],
    },
  },

  // 3. SQL and Database Essentials
  {
    title: 'SQL and Database Essentials',
    category: 'Database Management',
    level: 'intermediate',
    video: VIDEOS.sql,
    price: 0,
    description:
      'Learn relational databases, SQL queries, filtering, joins, aggregation, and database design fundamentals.',
    objectives: [
      'Write SELECT, INSERT, UPDATE, and DELETE queries',
      'Filter and sort database records',
      'Combine tables using JOIN',
      'Use GROUP BY and aggregate functions',
    ],
    sections: [
      ['SQL Fundamentals', ['Introduction to Databases', 'SELECT and WHERE', 'ORDER BY and LIMIT']],
      ['Data Modification', ['INSERT Statements', 'UPDATE and DELETE', 'Constraints']],
      ['Advanced Queries', ['INNER and LEFT JOIN', 'GROUP BY and HAVING', 'Aggregate Functions']],
    ],
    quiz: {
      title: 'SQL Essentials Quiz',
      questions: [
        {
          prompt: 'Which SQL statement retrieves data?',
          options: ['GET', 'SELECT', 'FETCH ALL'],
          correctIndex: 1,
          explanation: 'SELECT retrieves data from database tables.',
        },
        {
          prompt: 'Which clause filters grouped results?',
          options: ['WHERE', 'ORDER BY', 'HAVING'],
          correctIndex: 2,
          explanation: 'HAVING filters groups after GROUP BY is applied.',
        },
        {
          prompt: 'Which JOIN returns matching records from both tables?',
          options: ['INNER JOIN', 'CROSS JOIN', 'FULL JOIN'],
          correctIndex: 0,
          explanation: 'INNER JOIN returns rows that match the join condition in both tables.',
        },
      ],
    },
  },

  // 4. HTML and CSS
  {
    title: 'HTML and CSS Complete Course',
    category: 'Web Development',
    level: 'beginner',
    video: VIDEOS.htmlCss,
    price: 0,
    description:
      'Build attractive web pages using semantic HTML, CSS selectors, Flexbox, Grid, responsive layouts, and animations.',
    objectives: [
      'Create structured HTML pages',
      'Style pages using CSS',
      'Build responsive layouts',
      'Use Flexbox and CSS Grid',
    ],
    sections: [
      ['HTML Essentials', ['HTML Document Structure', 'Semantic Elements', 'Forms and Inputs']],
      ['CSS Fundamentals', ['Selectors and Specificity', 'Box Model', 'Typography and Colors']],
      ['Responsive Design', ['Flexbox', 'CSS Grid', 'Media Queries and Animations']],
    ],
    quiz: {
      title: 'HTML and CSS Quiz',
      questions: [
        {
          prompt: 'Which HTML element represents the main content of a page?',
          options: ['<footer>', '<main>', '<aside>'],
          correctIndex: 1,
          explanation: 'The main element identifies the dominant content of the document.',
        },
        {
          prompt: 'Which CSS property creates a Flexbox container?',
          options: ['display: grid', 'position: flex', 'display: flex'],
          correctIndex: 2,
          explanation: 'display: flex establishes a Flexbox layout.',
        },
        {
          prompt: 'Which CSS feature supports responsive breakpoints?',
          options: ['@media', '@font-face', '@keyframes'],
          correctIndex: 0,
          explanation: '@media applies styles based on viewport or device conditions.',
        },
      ],
    },
  },

  // 5. React.js
  {
    title: 'React.js Frontend Development',
    category: 'Web Development',
    level: 'intermediate',
    video: VIDEOS.react,
    price: 0,
    description:
      'Learn React components, JSX, props, state, Hooks, forms, routing, API integration, and frontend project architecture.',
    objectives: [
      'Build reusable React components',
      'Manage state using Hooks',
      'Fetch data from REST APIs',
      'Create multi-page React applications',
    ],
    sections: [
      ['React Fundamentals', ['Introduction to React', 'JSX and Components', 'Props and Component Composition']],
      ['State and Hooks', ['useState', 'useEffect', 'useRef and useContext']],
      ['Real Applications', ['Forms and Validation', 'React Router', 'REST API Integration']],
    ],
    quiz: {
      title: 'React.js Quiz',
      questions: [
        {
          prompt: 'Which Hook manages local component state?',
          options: ['useState', 'useRoute', 'usePage'],
          correctIndex: 0,
          explanation: 'useState adds state to a functional React component.',
        },
        {
          prompt: 'What is JSX?',
          options: ['A database', 'A JavaScript syntax extension', 'A CSS framework'],
          correctIndex: 1,
          explanation: 'JSX lets developers describe UI using HTML-like syntax in JavaScript.',
        },
        {
          prompt: 'Why are keys used when rendering lists?',
          options: ['To style elements', 'To identify items between renders', 'To create API requests'],
          correctIndex: 1,
          explanation: 'Keys help React identify list items when elements are added, removed, or reordered.',
        },
      ],
    },
  },

  // 6. Node.js and Express
  {
    title: 'Node.js and Express.js Backend',
    category: 'Backend Development',
    level: 'intermediate',
    video: VIDEOS.node,
    price: 0,
    description:
      'Develop server-side applications using Node.js, Express, middleware, routing, validation, error handling, and REST APIs.',
    objectives: [
      'Understand Node.js fundamentals',
      'Create Express servers and routes',
      'Build REST API endpoints',
      'Handle errors and validate requests',
    ],
    sections: [
      ['Node.js Fundamentals', ['Node.js Introduction', 'Modules and npm', 'Asynchronous JavaScript']],
      ['Express Development', ['Server Setup', 'Routes and Controllers', 'Middleware']],
      ['API Development', ['REST API Design', 'Validation and Error Handling', 'Environment Variables']],
    ],
    quiz: {
      title: 'Node.js Quiz',
      questions: [
        {
          prompt: 'What is Node.js?',
          options: ['A database', 'A JavaScript runtime', 'A CSS library'],
          correctIndex: 1,
          explanation: 'Node.js runs JavaScript outside the browser.',
        },
        {
          prompt: 'Which Express method handles GET requests?',
          options: ['app.get()', 'app.fetch()', 'app.read()'],
          correctIndex: 0,
          explanation: 'app.get() registers a handler for HTTP GET requests.',
        },
        {
          prompt: 'What is middleware in Express?',
          options: ['A database table', 'A request-processing function', 'A CSS component'],
          correctIndex: 1,
          explanation: 'Middleware can access the request, response, and next function.',
        },
      ],
    },
  },

  // 7. MongoDB
  {
    title: 'MongoDB Database Development',
    category: 'Database Management',
    level: 'intermediate',
    video: VIDEOS.mongodb,
    price: 0,
    description:
      'Learn NoSQL database concepts, collections, documents, CRUD operations, aggregation, indexing, and data modeling.',
    objectives: [
      'Understand documents and collections',
      'Perform CRUD operations',
      'Design MongoDB data models',
      'Use indexes and aggregation pipelines',
    ],
    sections: [
      ['MongoDB Basics', ['NoSQL Fundamentals', 'Documents and Collections', 'MongoDB Queries']],
      ['CRUD Operations', ['Insert Documents', 'Find and Update', 'Delete Documents']],
      ['Advanced MongoDB', ['Indexes', 'Aggregation Pipelines', 'Schema Design']],
    ],
    quiz: {
      title: 'MongoDB Quiz',
      questions: [
        {
          prompt: 'MongoDB primarily stores records as what?',
          options: ['Documents', 'Worksheets', 'HTML pages'],
          correctIndex: 0,
          explanation: 'MongoDB stores records as BSON documents.',
        },
        {
          prompt: 'Which method retrieves matching documents?',
          options: ['find()', 'selectAll()', 'readRows()'],
          correctIndex: 0,
          explanation: 'find() retrieves documents that match a query.',
        },
        {
          prompt: 'What is the purpose of an index?',
          options: ['Change page colors', 'Improve query performance', 'Create user interfaces'],
          correctIndex: 1,
          explanation: 'Indexes can help MongoDB find matching documents more efficiently.',
        },
      ],
    },
  },

  // 8. Full Stack MERN
  {
    title: 'Full Stack MERN Development',
    category: 'Full Stack Development',
    level: 'advanced',
    video: VIDEOS.mern,
    price: 0,
    description:
      'Build complete applications using MongoDB, Express.js, React, and Node.js with authentication, APIs, and deployment.',
    objectives: [
      'Connect React frontend to an Express API',
      'Build full-stack CRUD applications',
      'Implement authentication and authorization',
      'Deploy frontend and backend applications',
    ],
    sections: [
      ['MERN Foundations', ['MERN Architecture', 'Project Setup', 'Frontend and Backend Integration']],
      ['Application Development', ['CRUD Features', 'Authentication with JWT', 'Protected Routes']],
      ['Production', ['Environment Configuration', 'Deployment', 'Testing and Debugging']],
    ],
    quiz: {
      title: 'MERN Stack Quiz',
      questions: [
        {
          prompt: 'Which technology is used for the user interface?',
          options: ['MongoDB', 'React', 'Express'],
          correctIndex: 1,
          explanation: 'React is used to build interactive user interfaces.',
        },
        {
          prompt: 'Which component stores document data?',
          options: ['MongoDB', 'CSS', 'React Router'],
          correctIndex: 0,
          explanation: 'MongoDB is the database in the MERN stack.',
        },
        {
          prompt: 'What is JWT commonly used for?',
          options: ['Styling pages', 'Representing claims between parties', 'Compressing images'],
          correctIndex: 1,
          explanation: 'JSON Web Tokens can carry claims and are commonly used in authentication systems.',
        },
      ],
    },
  },

  // 9. Data Structures and Algorithms
  {
    title: 'Data Structures and Algorithms',
    category: 'Computer Science',
    level: 'intermediate',
    video: VIDEOS.dsa,
    price: 0,
    description:
      'Practice arrays, strings, linked lists, stacks, queues, trees, graphs, sorting, searching, and algorithm complexity.',
    objectives: [
      'Understand common data structures',
      'Analyze time and space complexity',
      'Implement sorting and searching',
      'Improve coding interview problem-solving',
    ],
    sections: [
      ['Foundations', ['Algorithm Basics', 'Time and Space Complexity', 'Arrays and Strings']],
      ['Data Structures', ['Linked Lists', 'Stacks and Queues', 'Trees and Binary Search Trees']],
      ['Algorithms', ['Sorting Algorithms', 'Searching Algorithms', 'Graph Traversal']],
    ],
    quiz: {
      title: 'DSA Quiz',
      questions: [
        {
          prompt: 'What is the typical time complexity of binary search on a sorted array?',
          options: ['O(n)', 'O(log n)', 'O(n²)'],
          correctIndex: 1,
          explanation: 'Binary search halves the remaining search space at each step.',
        },
        {
          prompt: 'Which data structure follows LIFO?',
          options: ['Queue', 'Stack', 'Graph'],
          correctIndex: 1,
          explanation: 'A stack follows Last In, First Out.',
        },
        {
          prompt: 'Which algorithm explores a graph level by level?',
          options: ['BFS', 'Binary search', 'Selection sort'],
          correctIndex: 0,
          explanation: 'Breadth-first search explores neighboring vertices before moving to the next level.',
        },
      ],
    },
  },

  // 10. Java Programming
  {
    title: 'Java Programming Fundamentals',
    category: 'Programming',
    level: 'beginner',
    video: VIDEOS.java,
    price: 0,
    description:
      'Learn Java syntax, object-oriented programming, classes, inheritance, interfaces, exceptions, and collections.',
    objectives: [
      'Write basic Java programs',
      'Understand classes and objects',
      'Apply object-oriented programming',
      'Work with collections and exceptions',
    ],
    sections: [
      ['Java Basics', ['JDK and JVM', 'Variables and Data Types', 'Conditions and Loops']],
      ['Object-Oriented Java', ['Classes and Objects', 'Inheritance and Polymorphism', 'Interfaces and Abstraction']],
      ['Core Java', ['Exception Handling', 'Collections Framework', 'File Handling']],
    ],
    quiz: {
      title: 'Java Fundamentals Quiz',
      questions: [
        {
          prompt: 'Which keyword creates an instance of a class?',
          options: ['new', 'class', 'static'],
          correctIndex: 0,
          explanation: 'The new keyword creates an object instance.',
        },
        {
          prompt: 'Which keyword is used to inherit a class in Java?',
          options: ['implements', 'extends', 'inherits'],
          correctIndex: 1,
          explanation: 'A Java class uses extends to inherit from another class.',
        },
        {
          prompt: 'Which method is the usual entry point of a Java application?',
          options: ['start()', 'main()', 'runApp()'],
          correctIndex: 1,
          explanation: 'The standard Java application entry point is the main method with the required signature.',
        },
      ],
    },
  },

  // 11. Git and GitHub
  {
    title: 'Git and GitHub for Developers',
    category: 'Developer Tools',
    level: 'beginner',
    video: VIDEOS.git,
    price: 0,
    description:
      'Learn version control, commits, branches, merges, remote repositories, pull requests, and collaborative development.',
    objectives: [
      'Track changes using Git',
      'Create and manage branches',
      'Work with GitHub repositories',
      'Collaborate through pull requests',
    ],
    sections: [
      ['Git Basics', ['Version Control Concepts', 'Repository Setup', 'Status and Commits']],
      ['Branching', ['Creating Branches', 'Merging Branches', 'Resolving Conflicts']],
      ['GitHub Collaboration', ['Remote Repositories', 'Push and Pull', 'Pull Requests']],
    ],
    quiz: {
      title: 'Git and GitHub Quiz',
      questions: [
        {
          prompt: 'Which command creates a new Git repository?',
          options: ['git start', 'git init', 'git create'],
          correctIndex: 1,
          explanation: 'git init initializes a new local Git repository.',
        },
        {
          prompt: 'Which command uploads local commits to a remote repository?',
          options: ['git push', 'git status', 'git log'],
          correctIndex: 0,
          explanation: 'git push sends local commits to a configured remote.',
        },
        {
          prompt: 'What is a Git branch used for?',
          options: ['Separating lines of development', 'Installing Node.js', 'Creating database tables'],
          correctIndex: 0,
          explanation: 'Branches let developers work on separate lines of development.',
        },
      ],
    },
  },

  // 12. REST API Development
  {
    title: 'REST API Design and Development',
    category: 'Backend Development',
    level: 'intermediate',
    video: VIDEOS.api,
    price: 0,
    description:
      'Learn HTTP methods, status codes, REST principles, request validation, pagination, API documentation, and error handling.',
    objectives: [
      'Understand HTTP and REST concepts',
      'Design consistent API endpoints',
      'Handle validation and errors',
      'Test APIs using development tools',
    ],
    sections: [
      ['HTTP Fundamentals', ['Requests and Responses', 'HTTP Methods', 'Status Codes and Headers']],
      ['REST API Design', ['Resources and Endpoints', 'CRUD API Design', 'Pagination and Filtering']],
      ['API Quality', ['Validation and Error Handling', 'API Documentation', 'Testing with Postman']],
    ],
    quiz: {
      title: 'REST API Quiz',
      questions: [
        {
          prompt: 'Which HTTP method is commonly used to retrieve a resource?',
          options: ['GET', 'DELETE', 'PATCH'],
          correctIndex: 0,
          explanation: 'GET retrieves a representation of a resource.',
        },
        {
          prompt: 'Which status code indicates a successful resource creation?',
          options: ['404', '201', '500'],
          correctIndex: 1,
          explanation: '201 Created indicates that a resource has been created.',
        },
        {
          prompt: 'What does API stand for?',
          options: ['Application Programming Interface', 'Automated Program Internet', 'Application Page Integration'],
          correctIndex: 0,
          explanation: 'API stands for Application Programming Interface.',
        },
      ],
    },
  },

  // 13. Web Security
  {
    title: 'Web Application Security Fundamentals',
    category: 'Cybersecurity',
    level: 'intermediate',
    video: VIDEOS.security,
    price: 0,
    description:
      'Learn web security fundamentals, secure authentication, access control, input validation, OWASP risks, and secure coding.',
    objectives: [
      'Understand common web application vulnerabilities',
      'Differentiate authentication and authorization',
      'Recognize SQL injection and XSS risks',
      'Apply secure coding principles',
    ],
    sections: [
      ['Security Basics', ['Security Fundamentals', 'Authentication and Authorization', 'Passwords and Sessions']],
      ['Common Vulnerabilities', ['SQL Injection', 'Cross-Site Scripting', 'Broken Access Control']],
      ['Secure Development', ['Input Validation', 'Security Headers', 'Dependency Updates and Code Review']],
    ],
    quiz: {
      title: 'Web Security Quiz',
      questions: [
        {
          prompt: 'What does authentication verify?',
          options: ['A user identity', 'A page layout', 'A database index'],
          correctIndex: 0,
          explanation: 'Authentication verifies who a user or system is.',
        },
        {
          prompt: 'Which practice helps prevent SQL injection?',
          options: ['Parameterized queries', 'Disabling all logging', 'Using longer URLs'],
          correctIndex: 0,
          explanation: 'Parameterized queries separate SQL code from user-supplied values.',
        },
        {
          prompt: 'What does the principle of least privilege mean?',
          options: ['Give every user administrator access', 'Grant only necessary permissions', 'Disable authentication'],
          correctIndex: 1,
          explanation: 'Least privilege limits permissions to those required for a task.',
        },
      ],
    },
  },

  // 14. TypeScript
  {
    title: 'TypeScript for JavaScript Developers',
    category: 'Web Development',
    level: 'intermediate',
    video: VIDEOS.typescript,
    price: 0,
    description:
      'Improve JavaScript projects with TypeScript types, interfaces, unions, generics, narrowing, and safer application development.',
    objectives: [
      'Configure TypeScript projects',
      'Define types and interfaces',
      'Use unions and generics',
      'Type React components and API data',
    ],
    sections: [
      ['TypeScript Basics', ['TypeScript Introduction', 'Primitive Types', 'Arrays and Objects']],
      ['Type System', ['Interfaces and Type Aliases', 'Union Types and Narrowing', 'Generics']],
      ['Application Development', ['Functions and Classes', 'Typing API Responses', 'TypeScript with React']],
    ],
    quiz: {
      title: 'TypeScript Quiz',
      questions: [
        {
          prompt: 'What is TypeScript primarily known for adding to JavaScript?',
          options: ['Static type checking', 'A new database engine', 'Built-in web hosting'],
          correctIndex: 0,
          explanation: 'TypeScript adds a type system that can detect many errors before runtime.',
        },
        {
          prompt: 'Which keyword declares an interface?',
          options: ['interface', 'implementsOnly', 'schema'],
          correctIndex: 0,
          explanation: 'The interface keyword declares an interface in TypeScript.',
        },
        {
          prompt: 'What is a union type?',
          options: ['A type that can be one of several specified types', 'A database join', 'A CSS selector'],
          correctIndex: 0,
          explanation: 'A union type allows a value to match any one of the listed types.',
        },
      ],
    },
  },

  // 15. Data Analytics with Python
  {
    title: 'Data Analytics with Python',
    category: 'Data Science',
    level: 'intermediate',
    video: VIDEOS.dataAnalytics,
    price: 0,
    description:
      'Explore datasets using Python, Pandas, data cleaning, exploratory analysis, visualization, and basic statistical concepts.',
    objectives: [
      'Load and inspect datasets',
      'Clean missing and inconsistent data',
      'Analyze data using Pandas',
      'Create charts and interpret findings',
    ],
    sections: [
      ['Analytics Foundations', ['Introduction to Data Analytics', 'Python and Jupyter', 'NumPy Basics']],
      ['Data Preparation', ['Pandas DataFrames', 'Missing Values', 'Filtering and Grouping']],
      ['Analysis and Visualization', ['Exploratory Data Analysis', 'Charts with Matplotlib', 'Communicating Insights']],
    ],
    quiz: {
      title: 'Data Analytics Quiz',
      questions: [
        {
          prompt: 'Which Python library is widely used for tabular data analysis?',
          options: ['Pandas', 'Flask', 'Socket.IO'],
          correctIndex: 0,
          explanation: 'Pandas provides DataFrame structures and tools for data manipulation.',
        },
        {
          prompt: 'What does exploratory data analysis help you do?',
          options: ['Understand patterns and distributions', 'Compile Java code', 'Create HTTP routes'],
          correctIndex: 0,
          explanation: 'EDA helps reveal distributions, patterns, relationships, and potential data quality issues.',
        },
        {
          prompt: 'Which chart is commonly used to show the distribution of a numeric variable?',
          options: ['Histogram', 'Network diagram', 'Gantt chart'],
          correctIndex: 0,
          explanation: 'A histogram groups numeric values into bins to show their distribution.',
        },
      ],
    },
  },
];




async function run() {
  try {
    await connectDB();

    await ensureDefaultCategories();

    const made = {};

    // Create or retrieve demo users.
    for (const u of users) {
      let user = await User.findOne({ email: u.email });

      if (!user) {
        user = await User.create({
          ...u,
          password: DEMO_PASSWORD,
        });
      }

      if (!user) {
        throw new Error(
          `Failed to create or find demo user: ${u.email}`
        );
      }

      made[u.role] = user;
    }

    // Validate the instructor before creating courses.
    if (!made.instructor) {
      throw new Error(
        'Instructor account is missing. Check the users array for a user with role "instructor".'
      );
    }

    // Create courses and their associated learning content.
    for (const c of courses) {
      console.log(`Seeding course: ${c.title}`);

      if (await Course.exists({ title: c.title })) {
        console.log(`Skipping existing course: ${c.title}`);
        continue;
      }

      const category = await Category.findOne({
        name: c.category,
      });

      if (!category) {
        throw new Error(
          `Category not found: "${c.category}". Check ensureDefaultCategories() and the course category names.`
        );
      }

      const slug = c.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const course = await Course.create({
        title: c.title,
        slug,
        shortDescription: c.description.split('.')[0] + '.',
        description: c.description,
        category: category._id,
        instructor: made.instructor._id,
        level: c.level,
        price: c.price,
        learningObjectives: c.objectives,
        status: 'published',
        publishedAt: new Date(),
        prerequisites: ['No prior experience needed'],
      });

      if (!course) {
        throw new Error(
          `Failed to create course: ${c.title}`
        );
      }

      // Validate the YouTube URL.
      const parsedVideo = parseYouTubeUrl(c.video);

      if (!parsedVideo) {
        throw new Error(
          `Invalid YouTube URL for course "${c.title}": ${c.video}`
        );
      }

      const { videoId, isShort } = parsedVideo;

      // Create sections and lessons.
      for (const [si, [sectionTitle, lessons]] of c.sections.entries()) {
        const section = await Section.create({
          course: course._id,
          title: sectionTitle,
          order: si,
        });

        if (!section) {
          throw new Error(
            `Failed to create section "${sectionTitle}" for "${c.title}"`
          );
        }

        for (const [li, title] of lessons.entries()) {
          await Lesson.create({
            course: course._id,
            section: section._id,
            title,
            order: li,
            youtubeVideoId: videoId,
            isShort,
            durationMinutes: 10,
            isPreview: si === 0 && li === 0,
            description:
              'Sample lesson. Replace the video link with your own from the lesson editor.',
          });
        }
      }

      // Create the quiz, if provided.
      if (c.quiz) {
        await Quiz.create({
          course: course._id,
          ...c.quiz,
          passingScore: 60,
        });
      }

      await refreshCourseCounters(course._id);

      console.log(`Created course successfully: ${c.title}`);
    }

    console.log('\nSeed complete.');
    console.log(
      'Demo logins (development only), password for all: ' +
        DEMO_PASSWORD
    );

    users.forEach((u) =>
      console.log(`  ${u.role.padEnd(10)} ${u.email}`)
    );
  } catch (err) {
    console.error('\nSeed failed:', err);
    throw err;
  } finally {
    await disconnectDB();
  }
}

run().catch(() => {
  process.exitCode = 1;
});


