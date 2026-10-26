import { useState } from 'react';
import { Users } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import ProgressBar from '../../components/dashboard/ProgressBar.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import useFetch from '../../hooks/useFetch.js';
import { getInstructorStudents } from '../../services/instructorService.js';
import { formatDate } from '../../utils/format.js';

export default function InstructorStudents() {
  const [page, setPage] = useState(1);
  const { data, meta, loading, error, reload } = useFetch((s) => getInstructorStudents({ page, limit: 15 }, s), [page]);
  return (
    <>
      <PageHeader title="Students" subtitle="Everyone enrolled in your courses and how far they have got." />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data?.length === 0 ? <StateBox icon={Users} title="No students yet" message="Students appear here after they enroll in one of your published courses." /> : (
          <>
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Student</th><th>Course</th><th>Enrolled</th><th>Progress</th><th>Status</th></tr></thead>
              <tbody>{data?.map((r) => (
                <tr key={r._id}><td><strong>{r.student.name}</strong><br /><small className="muted">{r.student.email}</small></td><td>{r.course.title}</td><td>{formatDate(r.enrolledAt)}</td>
                  <td className="progress-cell"><ProgressBar percent={r.percent} label={`${r.student.name} progress`} /><small>{r.completedLessons}/{r.totalLessons} lessons</small></td>
                  <td><span className={`badge ${r.status === 'completed' ? 'badge-success' : 'badge-muted'}`}>{r.status}</span></td></tr>
              ))}</tbody>
            </table></div>
            {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onChange={setPage} />}
          </>
        )}
      </DataState>
    </>
  );
}
