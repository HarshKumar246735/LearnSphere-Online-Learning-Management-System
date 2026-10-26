import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import EnrolledCourseCard from '../../components/dashboard/EnrolledCourseCard.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import useFetch from '../../hooks/useFetch.js';
import { getMyEnrollments } from '../../services/learningService.js';

export default function MyCourses() {
  const { data, loading, error, reload } = useFetch((s) => getMyEnrollments(s), []);
  return (
    <>
      <PageHeader title="My courses" subtitle="Everything you are enrolled in." />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data?.length === 0
          ? <StateBox icon={BookOpen} title="No courses yet" message="Enroll in a course to see it here." action={<Link to="/courses" className="btn btn-primary">Explore courses</Link>} />
          : <div className="grid-3">{data?.map((i) => <EnrolledCourseCard key={i._id} item={i} />)}</div>}
      </DataState>
    </>
  );
}
