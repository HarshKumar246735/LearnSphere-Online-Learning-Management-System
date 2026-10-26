import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import FormField from '../../components/auth/FormField.jsx';
import { sendContactMessage } from '../../services/courseService.js';
import { contactSchema } from '../../utils/validation.js';

export default function Contact() {
  const [params] = useSearchParams();
  const instructor = params.get('subject') === 'instructor';
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: instructor ? 'Instructor access request' : '', message: instructor ? 'I would like to teach on LearnSphere. Here is a little about me and the courses I would like to create:\n' : '' },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await sendContactMessage(values);
      setSent(true);
      reset();
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <section className="container page-section narrow">
      <div className="page-head"><div>
        <h1>{instructor ? 'Become an instructor' : 'Contact us'}</h1>
        <p>{instructor ? 'Tell us about yourself and what you would like to teach. Our team reviews every request and upgrades approved accounts.' : 'Questions, feedback or need help? Send us a message.'}</p>
      </div></div>
      {sent ? (
        <div className="card state-box">
          <span className="state-icon"><CheckCircle2 size={26} /></span>
          <h3>Message sent</h3>
          <p>Thanks for reaching out. We will reply to your email address.</p>
          <button type="button" className="btn btn-ghost" onClick={() => setSent(false)}>Send another message</button>
        </div>
      ) : (
        <form className="card form-card auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}
          <FormField id="name" label="Your name" autoComplete="name" error={errors.name?.message} {...register('name')} />
          <FormField id="email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <FormField id="subject" label="Subject" error={errors.subject?.message} {...register('subject')} />
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" className="textarea" rows={6} aria-invalid={errors.message ? 'true' : 'false'} aria-describedby={errors.message ? 'message-error' : undefined} {...register('message')} />
            {errors.message && <span id="message-error" className="field-error" role="alert">{errors.message.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send message'}</button>
        </form>
      )}
    </section>
  );
}
