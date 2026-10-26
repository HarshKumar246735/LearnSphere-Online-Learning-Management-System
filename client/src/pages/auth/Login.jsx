
import { useState } from 'react';
import {
  Link,
  Navigate,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import AuthShell from '../../components/auth/AuthShell.jsx';
import FormField from '../../components/auth/FormField.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { loginSchema } from '../../utils/validation.js';
import { dashboardPath, safeNext } from '../../utils/roles.js';

import '../../css/auth.css';

const DEMO_PASSWORD = 'Demo@12345';

const demoUsers = [
  {
    name: 'Admin',
    email: 'admin@learnsphere.dev',
    password: DEMO_PASSWORD,
  },
  {
    name: 'Instructor',
    email: 'instructor@learnsphere.dev',
    password: DEMO_PASSWORD,
  },
  {
    name: 'Student',
    email: 'student@learnsphere.dev',
    password: DEMO_PASSWORD,
  },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (user) {
    return (
      <Navigate
        to={safeNext(params.get('next'), dashboardPath(user.role))}
        replace
      />
    );
  }

  // Automatically fill credentials when a demo account is selected.
  const selectDemoAccount = (demoUser) => {
    setValue('email', demoUser.email, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue('password', demoUser.password, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setServerError('');
  };

  // Handle login.
  const onSubmit = async (values) => {
    setServerError('');

    try {
      const loggedInUser = await login(values);

      navigate(
        safeNext(
          params.get('next'),
          dashboardPath(loggedInUser.role)
        ),
        { replace: true }
      );
    } catch (err) {
      setServerError(
        err?.message || 'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your learning."
      footer={
        <>
          New here? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form
        className="auth-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {serverError && (
          <div className="alert alert-error" role="alert">
            {serverError}
          </div>
        )}

        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="auth-row">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg btn-block"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      {/* Demo Accounts */}
      <section className="demo-accounts" aria-labelledby="demo-title">
        <h3 id="demo-title">Demo accounts</h3>

        <p>
          Select a role to automatically fill the login form.
        </p>

        <div className="demo-account-list">
          {demoUsers.map((demoUser) => (
            <button
              key={demoUser.email}
              type="button"
              className="demo-account-button"
              onClick={() => selectDemoAccount(demoUser)}
              disabled={isSubmitting}
              aria-label={`Fill ${demoUser.name} demo account credentials`}
            >
              {demoUser.name}
            </button>
          ))}
        </div>

        <div className="demo-hint">
          Select an account, then click <strong>Log in</strong>.
        </div>
      </section>
    </AuthShell>
  );
}

