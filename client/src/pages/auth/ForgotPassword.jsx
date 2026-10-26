import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import AuthShell from '../../components/auth/AuthShell.jsx';
import FormField from '../../components/auth/FormField.jsx';
import { forgotPassword } from '../../services/authService.js';
import { forgotSchema } from '../../utils/validation.js';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await forgotPassword(values);
      setSent(true);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we will send you a reset link." footer={<Link to="/login">Back to login</Link>}>
      {sent ? (
        <div className="state-box">
          <span className="state-icon"><MailCheck size={26} /></span>
          <h3>Check your inbox</h3>
          <p>If an account exists for that email, a reset link is on its way. The link expires shortly, so use it soon.</p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}
          <FormField id="email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send reset link'}</button>
        </form>
      )}
    </AuthShell>
  );
}
