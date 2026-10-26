import { Quote } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { getTestimonials } from '../../services/courseService.js';
import { initials } from '../../utils/format.js';

// Only testimonials that signed-in users submitted and an admin approved are shown. With none, the section is hidden.
export default function Testimonials() {
  const { data } = useFetch((signal) => getTestimonials(signal), []);
  if (!data?.length) return null;
  return (
    <section className="section container">
      <div className="section-head"><div><h2>What learners say</h2></div></div>
      <div className="testimonial-grid">
        {data.map((t) => (
          <figure key={t._id} className="testimonial card">
            <Quote size={20} aria-hidden="true" />
            <blockquote>{t.quote}</blockquote>
            <figcaption>
              <span className="avatar">{initials(t.name)}</span>
              <span><strong>{t.name}</strong><small style={{ textTransform: 'capitalize' }}>{t.role}</small></span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
