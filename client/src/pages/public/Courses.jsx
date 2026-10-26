import CoursesBrowser from '../../components/courses/CoursesBrowser.jsx';

export default function Courses() {
  return (
    <section className="container page-section">
      <div className="page-head">
        <div><h1>Explore courses</h1><p>Search by title, topic or instructor, then narrow by category and difficulty.</p></div>
      </div>
      <CoursesBrowser />
    </section>
  );
}
