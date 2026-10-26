import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthShell from '../../components/auth/AuthShell.jsx';
import FormField from '../../components/auth/FormField.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { resetPassword } from '../../services/authService.js';
import { resetSchema } from '../../utils/validation.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const toast = useToast();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(resetSchema) });

  const onSubmit = async ({ password, confirmPassword }) => {
    setServerError('');
    try {
      await resetPassword({ token, password, confirmPassword });
      toast.success('Password updated. You can log in now.');
      navigate('/login', { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <AuthShell title="Choose a new password" footer={<Link to="/login">Back to login</Link>}>
      {!token ? (
        <div className="alert alert-error" role="alert">
          This reset link is missing its token. <Link to="/forgot-password">Request a new link</Link>.
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {serverError && <div className="alert alert-error" role="alert">{serverError} <Link to="/forgot-password">Request a new link</Link></div>}
          <FormField id="password" label="New password" type="password" autoComplete="new-password" hint="At least 8 characters with a letter and a number." error={errors.password?.message} {...register('password')} />
          <FormField id="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Update password'}</button>
        </form>
      )}
    </AuthShell>
  );
}
