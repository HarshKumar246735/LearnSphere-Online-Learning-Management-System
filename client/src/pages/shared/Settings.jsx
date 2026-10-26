import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import FormField from '../../components/auth/FormField.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { changePassword } from '../../services/socialService.js';
import { passwordField } from '../../utils/validation.js';

const schema = z.object({ currentPassword: z.string().min(1, 'Enter your current password'), newPassword: passwordField, confirmPassword: z.string().min(1, 'Confirm the new password') })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export default function Settings() {
  const toast = useToast();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  const onSubmit = async (values) => {
    setServerError('');
    try { await changePassword(values); toast.success('Password changed.'); reset(); } catch (e) { setServerError(e.message); }
  };
  return (
    <>
      <PageHeader title="Account settings" subtitle="Keep your account secure." />
      <form className="card pad auth-form narrow-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2>Change password</h2>
        {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}
        <FormField id="currentPassword" label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword')} />
        <FormField id="newPassword" label="New password" type="password" autoComplete="new-password" hint="At least 8 characters with a letter and a number." error={errors.newPassword?.message} {...register('newPassword')} />
        <FormField id="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Update password'}</button>
      </form>
    </>
  );
}
