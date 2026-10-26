import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import FormField from '../../components/auth/FormField.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { createCourse, updateCourse, getManagedCourse, getCategoriesList } from '../../services/instructorService.js';

const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
const schema = z.object({
  title: z.string().trim().min(5, 'Use at least 5 characters').max(120),
  slug: z.string().trim().toLowerCase().regex(/^$|^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens'),
  shortDescription: z.string().trim().max(200, 'Keep it under 200 characters'),
  description: z.string().trim().min(20, 'Describe the course in at least 20 characters').max(5000),
  thumbnail: z.string().trim().refine((v) => v === '' || /^https:\/\//i.test(v), 'Use an https:// link'),
  category: z.string().min(1, 'Choose a category'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  language: z.string().trim().min(2, 'Enter a language'),
  learningObjectives: z.string(),
  prerequisites: z.string(),
});

export default function CourseForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const cats = useFetch((s) => getCategoriesList(s), []);
  const existing = useFetch((s) => (editing ? getManagedCourse(id, s) : Promise.resolve({ data: { data: null } })), [id]);
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', slug: '', shortDescription: '', description: '', thumbnail: '', category: '', level: 'beginner', price: 0, language: 'English', learningObjectives: '', prerequisites: '' },
  });

  useEffect(() => {
    const c = existing.data?.course;
    if (c) reset({ title: c.title, slug: c.slug, shortDescription: c.shortDescription, description: c.description, thumbnail: c.thumbnail, category: String(c.category), level: c.level, price: c.price, language: c.language, learningObjectives: c.learningObjectives.join('\n'), prerequisites: c.prerequisites.join('\n') });
  }, [existing.data, reset]);

  const onSubmit = async (v) => {
    setServerError('');
    const payload = { ...v, learningObjectives: lines(v.learningObjectives), prerequisites: lines(v.prerequisites), slug: v.slug || undefined };
    try {
      if (editing) { await updateCourse(id, payload); toast.success('Course saved.'); navigate('/instructor/courses'); }
      else { const res = await createCourse(payload); toast.success('Course created. Now add sections and lessons.'); navigate(`/instructor/courses/${res.data.data.course._id}/curriculum`); }
    } catch (e) { setServerError(e.message); }
  };

  return (
    <>
      <PageHeader title={editing ? 'Edit course' : 'Create a course'} subtitle="Courses stay private until you publish them." />
      <DataState loading={existing.loading || cats.loading} error={existing.error || cats.error} onRetry={() => { existing.reload(); cats.reload(); }}>
        <form className="card pad auth-form course-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}
          <FormField id="title" label="Course title" error={errors.title?.message} {...register('title')} />
          <FormField id="slug" label="URL slug (optional)" hint="Used in the course link. Leave blank to generate one from the title." error={errors.slug?.message} {...register('slug')} />
          <FormField id="shortDescription" label="Short description" error={errors.shortDescription?.message} {...register('shortDescription')} />
          <div className="field"><label htmlFor="description">Full description</label><textarea id="description" className="textarea" rows={6} aria-invalid={errors.description ? 'true' : 'false'} {...register('description')} />{errors.description && <span className="field-error" role="alert">{errors.description.message}</span>}</div>
          <FormField id="thumbnail" label="Thumbnail image link (https)" error={errors.thumbnail?.message} {...register('thumbnail')} />
          <div className="form-row">
            <div className="field"><label htmlFor="category">Category</label>
              <select id="category" className="select" aria-invalid={errors.category ? 'true' : 'false'} {...register('category')}><option value="">Choose...</option>{cats.data?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
              {errors.category && <span className="field-error" role="alert">{errors.category.message}</span>}</div>
            <div className="field"><label htmlFor="level">Difficulty</label><select id="level" className="select" {...register('level')}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
          </div>
          <div className="form-row">
            <FormField id="price" label="Price (0 = free)" type="number" step="0.01" min="0" hint="Paid checkout is not available yet, so paid courses cannot be purchased." error={errors.price?.message} {...register('price')} />
            <FormField id="language" label="Course language" error={errors.language?.message} {...register('language')} />
          </div>
          <div className="field"><label htmlFor="learningObjectives">What students will learn (one per line)</label><textarea id="learningObjectives" className="textarea" rows={4} {...register('learningObjectives')} /></div>
          <div className="field"><label htmlFor="prerequisites">Prerequisites (one per line)</label><textarea id="prerequisites" className="textarea" rows={3} {...register('prerequisites')} /></div>
          <div className="lesson-actions"><button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editing ? 'Save changes' : 'Create course'}</button>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/instructor/courses')}>Cancel</button></div>
        </form>
      </DataState>
    </>
  );
}
