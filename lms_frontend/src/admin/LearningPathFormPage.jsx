import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addLearningPath, getAllCourses, getAllLearningPaths, updateLearningPath } from '../store/localStore';

const initialForm = {
  title: '',
  description: '',
  coverImage: '',
  courseIds: [],
};

function validate(values) {
  const errors = {};
  if (!values.title?.trim()) errors.title = 'Name/Title is required';
  if (!values.description?.trim()) errors.description = 'Description is required';
  if (!values.coverImage?.trim()) errors.coverImage = 'Cover image URL is required';
  return errors;
}

export default function LearningPathFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const allPaths = useMemo(() => getAllLearningPaths(), []);
  const allCourses = useMemo(() => getAllCourses(), []);
  const existing = isEdit ? allPaths.find((p) => String(p.id) === String(id)) : null;

  const [values, setValues] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existing) {
      setValues({
        title: existing.title ?? '',
        description: existing.description ?? '',
        coverImage: existing.coverImage ?? '',
        courseIds: Array.isArray(existing.courseIds) ? existing.courseIds.map(String) : [],
      });
    }
  }, [existing]);

  function onChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  function onToggleCourse(e) {
    const { value, checked } = e.target;
    setValues((v) => {
      const set = new Set(v.courseIds.map(String));
      if (checked) set.add(String(value));
      else set.delete(String(value));
      return { ...v, courseIds: Array.from(set) };
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = { ...values, courseIds: values.courseIds.map(String) };
    if (isEdit) {
      updateLearningPath(id, payload);
    } else {
      addLearningPath(payload);
    }
    navigate('/admin/learning-paths');
  }

  return (
    <div className="ocean-container">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Learning Path' : 'New Learning Path'}</h1>
        <span className="text-sm text-red-600">
          Demo-only admin (client-side). For production, wire to backend with auth.
        </span>
      </div>

      <form onSubmit={onSubmit} className="ocean-card p-6 mt-4 space-y-4" noValidate>
        <div>
          <label htmlFor="title" className="block text-sm font-medium">Name/Title</label>
          <input
            id="title"
            name="title"
            className="mt-1 w-full border rounded p-2"
            aria-invalid={Boolean(errors.title)}
            value={values.title}
            onChange={onChange}
            placeholder="Enter learning path name"
          />
          {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <textarea
            id="description"
            name="description"
            className="mt-1 w-full border rounded p-2"
            aria-invalid={Boolean(errors.description)}
            value={values.description}
            onChange={onChange}
            placeholder="Brief description"
            rows={4}
          />
          {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium">Cover Image URL</label>
          <input
            id="coverImage"
            name="coverImage"
            className="mt-1 w-full border rounded p-2"
            aria-invalid={Boolean(errors.coverImage)}
            value={values.coverImage}
            onChange={onChange}
            placeholder="https://..."
          />
          {errors.coverImage && <p className="text-sm text-red-600 mt-1">{errors.coverImage}</p>}
        </div>

        <fieldset className="mt-2">
          <legend className="block text-sm font-medium">Courses (optional)</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {allCourses.map((c) => (
              <label key={c.id} className="flex items-center gap-2 ocean-card p-2">
                <input
                  type="checkbox"
                  value={String(c.id)}
                  checked={values.courseIds.includes(String(c.id))}
                  onChange={onToggleCourse}
                />
                <span className="text-sm">{c.title}</span>
              </label>
            ))}
            {allCourses.length === 0 && (
              <p className="text-sm text-gray-600">No courses available to select.</p>
            )}
          </div>
        </fieldset>

        <div className="pt-2">
          <button type="submit" className="ocean-button btn">{isEdit ? 'Save Changes' : 'Create Learning Path'}</button>
        </div>
      </form>
    </div>
  );
}
