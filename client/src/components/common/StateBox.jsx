// Shared empty / error state. `action` is an optional React node (usually a button or link).
export default function StateBox({ icon: Icon, title, message, action }) {
  return (
    <div className="state-box" role="status">
      {Icon && <span className="state-icon"><Icon size={26} /></span>}
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
