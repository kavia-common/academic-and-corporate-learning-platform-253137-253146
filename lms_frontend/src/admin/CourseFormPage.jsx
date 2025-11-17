import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addCourse, getAllCourses, updateCourse } from '../store/localStore';

const initialForm = {
  title: '',
  description: '',
  image: '',
  difficulty: '',
  duration: '',
};

function validate(values) {
  const errors = {};
  if (!values.title?.trim()) errors.title = 'Title is required';
  if (!values.description?.trim()) errors.description = 'Description is required';
  if (!values.image?.trim()) errors.image = 'Image URL is required';
  return errors;
}

export default function CourseFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const allCourses = useMemo(() => getAllCourses(), []);
  const existing = isEdit ? allCourses.find((c) => String(c.id) === String(id)) : null;
  const [values, setValues] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existing) {
      setValues({
        title: existing.title ?? '',
        description: existing.description ?? '',
        image: existing.image ?? '',
        difficulty: existing.difficulty ?? '',
        duration: existing.duration ?? '',
      });
    }
  }, [existing]);

  function onChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (isEdit) {
      updateCourse(id, values);
    } else {
      addCourse(values);
    }
    navigate('/admin/courses');
  }

  return (
    <div className="ocean-container">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Course' : 'New Course'}</h1>
        <span className="text-sm text-red-600">
          Demo-only admin (client-side). For production, wire to backend with auth.
        </span>
      </div>

      <form onSubmit={onSubmit} className="ocean-card p-6 mt-4 space-y-4" noValidate>
        <div>
          <label htmlFor="title" className="block text-sm font-medium">Title</label>
          <input
            id="title"
            name="title"
            className="mt-1 w-full border rounded p-2"
            aria-invalid={Boolean(errors.title)}
            value={values.title}
            onChange={onChange}
            placeholder="Enter course title"
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
          <label htmlFor="image" className="block text-sm font-medium">Image URL</label>
          <input
            id="image"
            name="image"
            className="mt-1 w-full border rounded p-2"
            aria-invalid={Boolean(errors.image)}
            value={values.image}
            onChange={onChange}
            placeholder="https://..."
          />
          {errors.image && <p className="text-sm text-red-600 mt-1">{errors.image}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium">Difficulty (optional)</label>
            <input
              id="difficulty"
              name="difficulty"
              className="mt-1 w-full border rounded p-2"
              value={values.difficulty}
              onChange={onChange}
              placeholder="Beginner, Intermediate, Advanced"
            />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium">Duration (optional)</label>
            <input
              id="duration"
              name="duration"
              className="mt-1 w-full border rounded p-2"
              value={values.duration}
              onChange={onChange}
              placeholder="e.g., 4h 30m"
            />
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" className="ocean-button btn">{isEdit ? 'Save Changes' : 'Create Course'}</button>
        </div>
      </form>
    </div>
  );
}
