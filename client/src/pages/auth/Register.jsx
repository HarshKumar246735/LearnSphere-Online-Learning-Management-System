import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../../components/auth/AuthShell.jsx';
import FormField from '../../components/auth/FormField.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { registerSchema } from '../../utils/validation.js';
import { dashboardPath } from '../../utils/roles.js';

export default function Register() {
  const { user, register: signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema) });

  if (user) return <Navigate to={dashboardPath(user.role)} replace />;

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const u = await signUp(values);
      toast.success('Your account is ready. Welcome to LearnSphere!');
      navigate(dashboardPath(u.role), { replace: true });
    } catch (err) {
      // Show server-side field errors next to their inputs when the API supplies them.
      const fields = (err.details || []).filter((d) => d.field);
      fields.forEach((d) => setError(d.field, { message: d.message }));
      setServerError(fields.length ? '' : err.message);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start learning in a minute. It is free to sign up."
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}
        <FormField id="name" label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <FormField id="email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <FormField id="password" label="Password" type="password" autoComplete="new-password" hint="At least 8 characters with a letter and a number." error={errors.password?.message} {...register('password')} />
        <FormField id="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'}</button>
        <p className="field-hint">By signing up you agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
      </form>
    </AuthShell>
  );
}
