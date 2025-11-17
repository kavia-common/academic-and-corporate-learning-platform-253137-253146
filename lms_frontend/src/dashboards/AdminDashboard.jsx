import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container';
import { Card, CardHeader, CardBody as CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table } from '../components/ui/Table';
import { useAuth } from '../auth/AuthProvider';
import RoleRoute from '../auth/RoleRoute';
import { supabase } from '../supabase/client';
import {
  // Courses
  listCourses as getCoursesArrayCompat,
  createCourse as createCourseSvc,
  deleteCourse as deleteCourseSvc,
} from '../supabase/supabaseCourses';
import {
  // Assignments
  listAssignmentsByCourse as getAssignmentsByCourseArrayCompat,
  createAssignment as createAssignmentSvc,
  deleteAssignment as deleteAssignmentSvc,
} from '../supabase/supabaseAssignments';

/**
 * PUBLIC_INTERFACE
 * AdminDashboard
 *
 * Admin-only dashboard for managing courses and assignments.
 * - Uses shared UI kit components for consistent look with Student dashboard.
 * - Uses Supabase services from src/supabase/* with the shared client.
 * - Route-level protection is handled in routes.jsx using RoleRoute for 'admin'.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, role, status } = useAuth();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignments, setAssignments] = useState([]);

  const [courseForm, setCourseForm] = useState({ title: '', description: '' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', due_date: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAuthed = status === 'authenticated';
  const isAdmin = String(role || '').toLowerCase() === 'admin';

  // Double-protect UX, though routes already gate admins
  useEffect(() => {
    if (isAuthed && !isAdmin) navigate('/', { replace: true });
  }, [isAuthed, isAdmin, navigate]);

  // Load courses initially
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const list = await getCoursesArrayCompat({ page: 1, pageSize: 100 });
        if (!mounted) return;
        setCourses(list || []);
        if (list?.length && !selectedCourseId) {
          setSelectedCourseId(String(list[0].id));
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load courses.');
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []); // initial load only

  // Load assignments when course changes
  useEffect(() => {
    let active = true;
    (async () => {
      if (!selectedCourseId) {
        setAssignments([]);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const list = await getAssignmentsByCourseArrayCompat(selectedCourseId, { page: 1, pageSize: 200 });
        if (!active) return;
        setAssignments(list || []);
      } catch (e) {
        if (!active) return;
        setError(e?.message || 'Failed to load assignments.');
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedCourseId]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      setError('Course title is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Extend payload: instructor_id may be required by service validation
      const payload = {
        ...courseForm,
        instructor_id: user?.id || 'admin', // fallback, depends on RLS
      };
      const res = await createCourseSvc(payload);
      if (res?.ok === false) {
        throw new Error(res?.error?.message || 'Failed to create course.');
      }
      setCourseForm({ title: '', description: '' });
      const list = await getCoursesArrayCompat({ page: 1, pageSize: 100 });
      setCourses(list || []);
      // Select newly created if id present
      const created = res?.data;
      if (created?.id) setSelectedCourseId(String(created.id));
    } catch (e) {
      setError(e?.message || 'Failed to create course.');
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    setError('');
    try {
      const res = await deleteCourseSvc(courseId);
      if (res?.ok === false) {
        throw new Error(res?.error?.message || 'Failed to delete course.');
      }
      const list = await getCoursesArrayCompat({ page: 1, pageSize: 100 });
      setCourses(list || []);
      if (String(courseId) === String(selectedCourseId)) {
        setSelectedCourseId(list?.[0]?.id ? String(list[0].id) : '');
        setAssignments([]);
      }
    } catch (e) {
      setError(e?.message || 'Failed to delete course.');
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setError('Please select a course for the assignment.');
      return;
    }
    if (!assignmentForm.title.trim()) {
      setError('Assignment title is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...assignmentForm,
        course_id: selectedCourseId,
      };
      const res = await createAssignmentSvc(payload);
      if (res?.ok === false) {
        throw new Error(res?.error?.message || 'Failed to create assignment.');
      }
      setAssignmentForm({ title: '', description: '', due_date: '' });
      const list = await getAssignmentsByCourseArrayCompat(selectedCourseId, { page: 1, pageSize: 200 });
      setAssignments(list || []);
    } catch (e) {
      setError(e?.message || 'Failed to create assignment.');
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!assignmentId) return;
    setLoading(true);
    setError('');
    try {
      const res = await deleteAssignmentSvc(assignmentId);
      if (res?.ok === false) {
        throw new Error(res?.error?.message || 'Failed to delete assignment.');
      }
      const list = await getAssignmentsByCourseArrayCompat(selectedCourseId, { page: 1, pageSize: 200 });
      setAssignments(list || []);
    } catch (e) {
      setError(e?.message || 'Failed to delete assignment.');
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  };



  const Recharts = useMemo(() => {
    try {
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = require('recharts');
      return { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer };
    } catch (_e) {
      return null;
    }
  }, []);

  const metricData = [
    { name: 'Courses', value: courses.length },
    { name: 'Assignments', value: assignments.length },
  ];

  return (
    <Container>
      <main className="w-full px-4 md:px-6 py-6 space-y-6" style={{ margin: '0 auto', maxWidth: 1280 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            <p className="text-gray-600 mt-1">Manage courses and assignments</p>
          </div>
          <div className="text-sm text-gray-500">
            {user?.email ? `Signed in as ${user.email}` : ''}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-2">
            {error}
          </div>
        )}

        {Recharts && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 220 }}>
                <Recharts.ResponsiveContainer>
                  <Recharts.BarChart data={metricData}>
                    <Recharts.XAxis dataKey="name" />
                    <Recharts.YAxis allowDecimals={false} />
                    <Recharts.Tooltip />
                    <Recharts.Bar dataKey="value" fill="#2563EB" />
                  </Recharts.BarChart>
                </Recharts.ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <div id="courses" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Courses</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table
                  columns={[
                    { key: 'title', header: 'Title' },
                    { key: 'description', header: 'Description' },
                    { key: 'actions', header: 'Actions', className: 'text-right' },
                  ]}
                  data={courses.map((c) => ({
                    title: <div className="font-medium">{c.title}</div>,
                    description: <div className="text-gray-600">{c.description}</div>,
                    actions: (
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedCourseId(String(c.id))}
                        >
                          Select
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteCourse(c.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ),
                  }))}
                  caption="Courses"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Create Course</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCourse} className="space-y-3">
                <Input
                  label="Title"
                  placeholder="Course title"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
                <Input
                  label="Description"
                  placeholder="Short description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div id="assignments" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Assignments {selectedCourseId ? `— Course ${selectedCourseId}` : ''}</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table
                  columns={[
                    { key: 'title', header: 'Title' },
                    { key: 'due', header: 'Due' },
                    { key: 'actions', header: 'Actions', className: 'text-right' },
                  ]}
                  data={assignments.map((a) => ({
                    title: <div className="font-medium">{a.title}</div>,
                    due: (
                      <div className="text-gray-600">
                        {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
                      </div>
                    ),
                    actions: (
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteAssignment(a.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ),
                  }))}
                  caption={selectedCourseId ? 'Assignments for selected course' : 'Select a course to view assignments'}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Create Assignment</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAssignment} className="space-y-3">
                <Select
                  label="Course"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  options={[
                    { value: '', label: 'Select a course' },
                    ...courses.map(c => ({ value: String(c.id), label: c.title })),
                  ]}
                  required
                />
                <Input
                  label="Title"
                  placeholder="Assignment title"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  required
                />
                <Input
                  label="Description"
                  placeholder="Short description"
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                />
                <Input
                  label="Due date"
                  type="date"
                  value={assignmentForm.due_date}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading || !selectedCourseId}>
                    {loading ? 'Saving...' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </Container>
  );
}
