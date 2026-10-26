import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch.js';
import Skeleton from '../common/Skeleton.jsx';
import { getCategories } from '../../services/courseService.js';
import { categoryIcon } from '../../utils/icons.js';

export default function CategoryGrid() {
  const { data, loading, error } = useFetch((signal) => getCategories(signal), []);
  if (error) return null;
  return (
    <section className="section container" id="categories">
      <div className="section-head">
        <div>
          <h2>Browse categories</h2>
          <p>Pick a topic and see what you can learn.</p>
        </div>
      </div>
      <div className="category-grid">
        {loading
          ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} height={92} radius="18px" />)
          : data.map((c) => {
              const Icon = categoryIcon(c.icon);
              return (
                <Link key={c._id} to={`/categories/${c.slug}`} className="category-card">
                  <span className="category-icon"><Icon size={22} aria-hidden="true" /></span>
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.courseCount} {c.courseCount === 1 ? 'course' : 'courses'}</small>
                  </span>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
