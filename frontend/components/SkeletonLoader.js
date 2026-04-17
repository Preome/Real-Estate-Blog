export default function SkeletonLoader({ type = 'post', count = 3 }) {
  if (type === 'post') {
    return (
      <div className="skeleton-grid">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'single-post') {
    return (
      <div className="skeleton-single-post">
        <div className="skeleton-back-link"></div>
        <div className="skeleton-hero"></div>
        <div className="skeleton-title large"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text"></div>
      </div>
    )
  }

  return null
}