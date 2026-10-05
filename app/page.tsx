export default function Home() {
  return (
    <section className="foundation">
      <p className="eyebrow">Validation MVP</p>
      <h1>Find software the algorithms missed.</h1>
      <p className="foundation__copy">
        The application foundation is running. Discovery functionality will be
        implemented in later issues.
      </p>
      <div className="foundation__status" aria-label="Foundation status">
        <span className="status-dot" aria-hidden="true" />
        Issue #1 · Foundation &amp; Core Infrastructure
      </div>
    </section>
  );
}
