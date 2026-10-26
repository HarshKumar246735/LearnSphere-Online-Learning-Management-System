import { Link } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import useFetch from '../../hooks/useFetch.js';
import { getEnrolledQuizzes } from '../../services/learningService.js';

export default function StudentQuizzes() {
  const { data, loading, error, reload } = useFetch((s) => getEnrolledQuizzes(s), []);
  return (
    <>
      <PageHeader title="My quizzes" subtitle="Quizzes from the courses you are enrolled in." />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data?.length === 0 ? <StateBox icon={ClipboardCheck} title="No quizzes yet" message="Quizzes appear here when your courses include them." /> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Quiz</th><th>Course</th><th>Questions</th><th>Best score</th><th>Status</th><th><span className="sr-only">Action</span></th></tr></thead>
            <tbody>{data?.map((q) => {
              const exhausted = q.maxAttempts && q.attemptsUsed >= q.maxAttempts;
              return (
                <tr key={q._id}>
                  <td><strong>{q.title}</strong><br /><small className="muted">{q.isRequired ? 'Required' : 'Optional'} · pass {q.passingScore}%</small></td>
                  <td>{q.course?.title}</td><td>{q.questionCount}</td>
                  <td>{q.bestScore == null ? '-' : `${q.bestScore}%`}</td>
                  <td>{q.passed ? <span className="badge badge-success">Passed</span> : q.attemptsUsed ? <span className="badge badge-warn">Not passed</span> : <span className="badge badge-muted">Not started</span>}</td>
                  <td>{exhausted ? <small className="muted">No attempts left</small> : <Link to={`/student/quizzes/${q._id}`} className="btn btn-ghost btn-sm">{q.attemptsUsed ? 'Retake' : 'Start'}</Link>}</td>
                </tr>
              );
            })}</tbody>
          </table></div>
        )}
      </DataState>
    </>
  );
}
