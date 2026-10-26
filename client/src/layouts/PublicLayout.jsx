import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import AnnouncementBanner from '../components/layout/AnnouncementBanner.jsx';

export default function PublicLayout() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <AnnouncementBanner />
      <Navbar />
      <main id="main"><Outlet /></main>
      <Footer />
    </>
  );
}
