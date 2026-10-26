import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourseFilters from './CourseFilters.jsx';
import CourseGrid from './CourseGrid.jsx';
import Pagination from '../common/Pagination.jsx';
import useFetch from '../../hooks/useFetch.js';
import useDebounce from '../../hooks/useDebounce.js';
import { listCourses, getCategories } from '../../services/courseService.js';

const PAGE_SIZE = 9;

// Search, filters, sorting and pagination, all stored in the URL so results can be shared and bookmarked.
export default function CoursesBrowser({ fixedCategory }) {
  const [params, setParams] = useSearchParams();
  const values = {
    search: params.get('search') || '',
    category: fixedCategory || params.get('category') || '',
    level: params.get('level') || '',
    sort: params.get('sort') || 'newest',
    free: params.get('free') === 'true',
  };
  const page = Math.max(1, Number(params.get('page')) || 1);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === false || v == null || (k === 'sort' && v === 'newest')) next.delete(k);
      else next.set(k, String(v));
    });
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const [searchInput, setSearchInput] = useState(values.search);
  const debounced = useDebounce(searchInput);
  useEffect(() => {
    if (debounced !== values.search) update({ search: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const categories = useFetch((signal) => getCategories(signal), []);
  const { data, meta, loading, error, reload } = useFetch(
    (signal) => listCourses({
      page, limit: PAGE_SIZE, search: values.search || undefined, category: values.category || undefined,
      level: values.level || undefined, free: values.free ? 'true' : undefined, sort: values.sort,
    }, signal),
    [page, values.search, values.category, values.level, values.sort, values.free],
  );

  const reset = () => { setSearchInput(''); setParams(new URLSearchParams(), { replace: true }); };
  const filtersActive = values.search || values.level || values.free || (!fixedCategory && values.category);

  const onFilterChange = (patch) => {
    if ('search' in patch) setSearchInput(patch.search);
    else update(patch);
  };

  return (
    <>
      <CourseFilters
        values={{ ...values, search: searchInput }}
        categories={categories.data || []}
        hideCategory={Boolean(fixedCategory)}
        onChange={onFilterChange}
        onReset={reset}
      />
      <p className="results-count" aria-live="polite">
        {!loading && !error && meta ? `${meta.total} ${meta.total === 1 ? 'course' : 'courses'} found` : '\u00a0'}
      </p>
      <CourseGrid
        courses={data}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle={filtersActive ? 'No courses match your search' : 'No courses yet'}
        emptyMessage={filtersActive ? 'Try a different keyword or clear some filters.' : 'Courses will appear here as soon as instructors publish them.'}
        emptyAction={filtersActive ? <button type="button" className="btn btn-primary" onClick={reset}>Clear filters</button> : null}
        skeletons={PAGE_SIZE}
      />
      {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onChange={(p) => { update({ page: p }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
    </>
  );
}
