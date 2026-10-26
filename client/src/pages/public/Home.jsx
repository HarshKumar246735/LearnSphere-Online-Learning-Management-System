import Hero from '../../components/landing/Hero.jsx';
import StatsStrip from '../../components/landing/StatsStrip.jsx';
import FeaturedCourses from '../../components/landing/FeaturedCourses.jsx';
import CategoryGrid from '../../components/landing/CategoryGrid.jsx';
import WhyChoose from '../../components/landing/WhyChoose.jsx';
import HowItWorks from '../../components/landing/HowItWorks.jsx';
import InstructorCTA from '../../components/landing/InstructorCTA.jsx';
import Testimonials from '../../components/landing/Testimonials.jsx';
import FAQ from '../../components/landing/FAQ.jsx';
import FinalCTA from '../../components/landing/FinalCTA.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <FeaturedCourses />
      <CategoryGrid />
      <WhyChoose />
      <HowItWorks />
      <InstructorCTA />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}
