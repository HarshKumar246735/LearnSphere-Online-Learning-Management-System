const steps = [
  ['Create an account', 'Sign up for free with your email.'],
  ['Discover a course', 'Search or browse by category and level.'],
  ['Enroll in the course', 'Free courses are available instantly.'],
  ['Watch lessons and complete quizzes', 'Learn in short video lessons without leaving LearnSphere.'],
  ['Track your progress', 'Your progress is saved so you can resume any time.'],
  ['Earn a certificate', 'Complete the course to receive a verifiable certificate.'],
];

export default function HowItWorks() {
  return (
    <section className="section container">
      <div className="section-head"><div><h2>How it works</h2><p>From sign-up to certificate in six steps.</p></div></div>
      <ol className="steps">
        {steps.map(([title, text]) => (
          <li key={title}><h3>{title}</h3><p>{text}</p></li>
        ))}
      </ol>
    </section>
  );
}
