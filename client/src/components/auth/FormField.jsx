import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Label, input and inline error wired together with the right aria attributes.
const FormField = forwardRef(function FormField({ id, label, error, hint, type = 'text', ...rest }, ref) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={isPassword ? 'input-icon input-icon-right' : undefined}>
        <input
          id={id} ref={ref} className="input" type={isPassword && show ? 'text' : type}
          aria-invalid={error ? 'true' : 'false'} aria-describedby={describedBy} {...rest}
        />
        {isPassword && (
          <button type="button" className="input-toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hint && !error && <span id={`${id}-hint`} className="field-hint">{hint}</span>}
      {error && <span id={`${id}-error`} className="field-error" role="alert">{error}</span>}
    </div>
  );
});

export default FormField;
