const faqs = [
  ['How do I enroll in a course?', 'Create a free account, open a course and choose Enroll. Free courses unlock immediately. Paid-course checkout is not available yet.'],
  ['Do I need to pay to start learning?', 'No. You can browse every course for free, and many courses are free to take.'],
  ['How do certificates work?', 'When you complete all required lessons and pass any required quizzes, a certificate with a unique ID is issued. Anyone can check it on the verification page.'],
  ['Why does a video not play?', 'Lessons use videos hosted on YouTube and shown inside LearnSphere. If the owner has made a video private, removed it or turned off embedding, it cannot play here. Let the instructor know through messages.'],
  ['I forgot my password. What now?', 'Choose Forgot password on the login page and enter your email. If an account exists you will receive a link that expires after a short time.'],
  ['Can I learn on my phone?', 'Yes. LearnSphere works in any modern browser on phones, tablets and computers.'],
];

export default function FAQ() {
  return (
    <section className="section container faq">
      <div className="section-head"><div><h2>Frequently asked questions</h2></div></div>
      <div className="faq-list">
        {faqs.map(([q, a]) => (
          <details key={q} className="faq-item">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
