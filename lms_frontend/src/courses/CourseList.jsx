import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCourses as listCourses } from '../supabase';
import { useAuth } from '../auth/AuthProvider';
import { Table } from '../components/ui/Table';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

/**
 * PUBLIC_INTERFACE
 * CourseList renders available courses (all for students; instructor's own for instructors if filtered).
 */
export default function CourseList() {
  const { status, role, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const data = await listCourses();
        if (!mounted) return;
        setCourses(data);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Unable to load courses.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'description', header: 'Description' },
    { key: 'actions', header: 'Actions' },
  ];
  const data = courses.map((c) => ({
    title: <Link to={`/courses/${c.id}`} className="text-blue-600 hover:underline font-medium">{c.title}</Link>,
    description: c.description || '—',
    actions:
      isAuthed && (r === 'instructor' || r === 'admin') && user?.id === c.instructor_id ? (
        <Link to={`/courses/${c.id}/edit`} className="text-blue-600 hover:underline">
          Edit
        </Link>
      ) : (
        ''
      ),
  }));

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Courses</h1>
          {isAuthed && (r === 'instructor' || r === 'admin') && (
            <Button as={Link} to="/courses/new" aria-label="Create course">Create course</Button>
          )}
        </CardHeader>
        <CardBody>
          {loading && <div className="rounded-md border border-gray-200 bg-white p-3 text-sm">Loading courses…</div>}
          {err && !loading && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {err}
            </div>
          )}
          {!loading && !err && (
            <Table columns={columns} data={data} caption="List of available courses" />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
