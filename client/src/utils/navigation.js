import {
  LayoutDashboard, BookOpen, GraduationCap, ClipboardCheck, Award, MessageSquare, Bell, User, Settings,
  PlusCircle, Users, BarChart3, FolderTree, Star, Flag, Library,
} from 'lucide-react';

export const publicLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Explore Courses' },
  { to: '/#categories', label: 'Categories', hash: true },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export const dashboardNav = {
  student: [
    { group: 'Learn', items: [
      { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/student/courses', label: 'My courses', icon: BookOpen },
      { to: '/student/quizzes', label: 'My quizzes', icon: ClipboardCheck },
      { to: '/student/certificates', label: 'Certificates', icon: Award },
      { to: '/student/study-rooms', label: 'Study rooms', icon: Users },
    ] },
    { group: 'Connect', items: [
      { to: '/student/messages', label: 'Messages', icon: MessageSquare, badge: 'messages' },
      { to: '/student/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
    ] },
    { group: 'Account', items: [
      { to: '/student/profile', label: 'Profile', icon: User },
      { to: '/student/settings', label: 'Settings', icon: Settings },
    ] },
  ],
  instructor: [
    { group: 'Teach', items: [
      { to: '/instructor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/instructor/courses', label: 'Courses', icon: BookOpen },
      { to: '/instructor/courses/new', label: 'New course', icon: PlusCircle },
      { to: '/instructor/quizzes', label: 'Quizzes', icon: ClipboardCheck },
    ] },
    { group: 'Students', items: [
      { to: '/instructor/students', label: 'Students', icon: GraduationCap },
      { to: '/instructor/messages', label: 'Messages', icon: MessageSquare, badge: 'messages' },
      { to: '/instructor/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/instructor/study-rooms', label: 'Study rooms', icon: Users },
      { to: '/instructor/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
    ] },
    { group: 'Account', items: [{ to: '/instructor/profile', label: 'Profile', icon: User }, { to: '/instructor/settings', label: 'Settings', icon: Settings }] },
  ],
  admin: [
    { group: 'Platform', items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/courses', label: 'Courses', icon: Library },
      { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    ] },
    { group: 'Moderation', items: [
      { to: '/admin/reviews', label: 'Reviews', icon: Star },
      { to: '/admin/reports', label: 'Reports', icon: Flag },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
      { to: '/admin/profile', label: 'Profile', icon: User },
    ] },
  ],
};
