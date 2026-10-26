import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import RoleLayout from '../layouts/RoleLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Home from '../pages/public/Home.jsx';
import Courses from '../pages/public/Courses.jsx';
import CourseDetails from '../pages/public/CourseDetails.jsx';
import CategoryPage from '../pages/public/CategoryPage.jsx';
import About from '../pages/public/About.jsx';
import Contact from '../pages/public/Contact.jsx';
import Privacy from '../pages/public/Privacy.jsx';
import Terms from '../pages/public/Terms.jsx';
import NotFound from '../pages/public/NotFound.jsx';
import CertificateVerify from '../pages/public/CertificateVerify.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';
import Messages from '../pages/shared/Messages.jsx';
import Notifications from '../pages/shared/Notifications.jsx';
import Profile from '../pages/shared/Profile.jsx';
import Settings from '../pages/shared/Settings.jsx';
import StudyRooms from '../pages/shared/StudyRooms.jsx';
import StudentDashboard from '../pages/student/Dashboard.jsx';
import MyCourses from '../pages/student/MyCourses.jsx';
import Learn from '../pages/student/Learn.jsx';
import StudentQuizzes from '../pages/student/Quizzes.jsx';
import QuizPlayer from '../pages/student/QuizPlayer.jsx';
import Certificates from '../pages/student/Certificates.jsx';
import InstructorDashboard from '../pages/instructor/Dashboard.jsx';
import InstructorCourses from '../pages/instructor/Courses.jsx';
import CourseForm from '../pages/instructor/CourseForm.jsx';
import Curriculum from '../pages/instructor/Curriculum.jsx';
import InstructorQuizzes from '../pages/instructor/Quizzes.jsx';
import InstructorStudents from '../pages/instructor/Students.jsx';
import Analytics from '../pages/instructor/Analytics.jsx';
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import AdminUsers from '../pages/admin/Users.jsx';
import AdminCourses from '../pages/admin/Courses.jsx';
import AdminCategories from '../pages/admin/Categories.jsx';
import AdminReviews from '../pages/admin/Reviews.jsx';
import AdminReports from '../pages/admin/Reports.jsx';
import AdminSettings from '../pages/admin/Settings.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:slug" element={<CourseDetails />} />
        <Route path="categories/:slug" element={<CategoryPage />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="certificates/verify/:certificateId" element={<CertificateVerify />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute roles={['student']} />}>
        <Route path="student" element={<RoleLayout role="student" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="learn/:courseSlug" element={<Learn />} />
          <Route path="quizzes" element={<StudentQuizzes />} />
          <Route path="quizzes/:quizId" element={<QuizPlayer />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="study-rooms" element={<StudyRooms />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['instructor', 'admin']} />}>
        <Route path="instructor" element={<RoleLayout role="instructor" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="courses" element={<InstructorCourses />} />
          <Route path="courses/new" element={<CourseForm />} />
          <Route path="courses/:id/edit" element={<CourseForm />} />
          <Route path="courses/:id/curriculum" element={<Curriculum />} />
          <Route path="quizzes" element={<InstructorQuizzes />} />
          <Route path="students" element={<InstructorStudents />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="study-rooms" element={<StudyRooms />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="admin" element={<RoleLayout role="admin" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      <Route element={<PublicLayout />}><Route path="*" element={<NotFound />} /></Route>
    </Routes>
  );
}
