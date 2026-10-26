import { Search } from 'lucide-react';

export default function CourseFilters({ values, categories = [], hideCategory = false, onChange, onReset }) {
  const set = (key) => (e) => onChange({ [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  return (
    <form className="filters card" role="search" aria-label="Filter courses" onSubmit={(e) => e.preventDefault()}>
      <div className="field filters-search">
        <label htmlFor="f-search">Search</label>
        <div className="input-icon">
          <Search size={18} aria-hidden="true" />
          <input id="f-search" className="input" type="search" placeholder="Title, topic or instructor" value={values.search} onChange={set('search')} />
        </div>
      </div>
      {!hideCategory && (
        <div className="field">
          <label htmlFor="f-category">Category</label>
          <select id="f-category" className="select" value={values.category} onChange={set('category')}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
      )}
      <div className="field">
        <label htmlFor="f-level">Difficulty</label>
        <select id="f-level" className="select" value={values.level} onChange={set('level')}>
          <option value="">Any level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-sort">Sort by</label>
        <select id="f-sort" className="select" value={values.sort} onChange={set('sort')}>
          <option value="newest">Newest</option>
          <option value="popular">Most popular</option>
          <option value="rating">Highest rated</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="title">Title A to Z</option>
        </select>
      </div>
      <label className="check filters-free">
        <input type="checkbox" checked={values.free} onChange={set('free')} /> Free courses only
      </label>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>Clear filters</button>
    </form>
  );
}
