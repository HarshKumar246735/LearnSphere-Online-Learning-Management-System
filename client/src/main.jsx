import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './css/variables.css';
import './css/global.css';
import './css/common.css';
import './css/navbar.css';
import './css/footer.css';
import './css/dashboard-layout.css';
import './css/landing.css';
import './css/courses.css';
import './css/course-details.css';
import './css/auth.css';
import './css/static-pages.css';
import './css/student-dashboard.css';
import './css/instructor-dashboard.css';
import './css/admin-dashboard.css';
import './css/lesson-player.css';
import './css/quizzes.css';
import './css/certificates.css';
import './css/chat.css';
import './css/notifications.css';
import './css/profile.css';

import './css/responsive.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
