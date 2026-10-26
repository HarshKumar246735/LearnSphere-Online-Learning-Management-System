import { useParams } from 'react-router-dom';
import CoursesBrowser from '../../components/courses/CoursesBrowser.jsx';
import NotFound from './NotFound.jsx';
import useFetch from '../../hooks/useFetch.js';
import { getCategories } from '../../services/courseService.js';

export default function CategoryPage() {
  const { slug } = useParams();
  const { data, loading } = useFetch((signal) => getCategories(signal), []);
  const category = data?.find((c) => c.slug === slug);
  if (!loading && data && !category) return <NotFound />;
  return (
    <section className="container page-section">
      <div className="page-head">
        <div>
          <h1>{category?.name || 'Category'}</h1>
          <p>{category?.description}</p>
        </div>
      </div>
      <CoursesBrowser key={slug} fixedCategory={slug} />
    </section>
  );
}
