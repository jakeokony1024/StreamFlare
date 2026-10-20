function ProviderGroup({ title, providers, kind }) {
  if (!providers || providers.length === 0) return null;

  return (
    <div className="provider-group">
      <p className="provider-kind">{title}</p>
      <div className="provider-list">
        {providers.map((provider) => (
          <span className={`provider-chip ${kind}`} key={provider.id} title={provider.name}>
            {provider.logo && <img src={provider.logo} alt="" loading="lazy" />}
            <span>{provider.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ShowCard({ show }) {
  const year = show.releaseDate ? show.releaseDate.slice(0, 4) : 'Year unknown';
  const hasProviders = show.providers.subscription.length || show.providers.free.length || show.providers.adSupported.length;

  return (
    <article className="show-card">
      <div className="show-poster-wrap">
        {show.poster
          ? <img className="show-poster" src={show.poster} alt={`${show.title} poster`} loading="lazy" />
          : <div className="show-poster poster-placeholder" aria-label="No poster available">SF</div>}
        {show.rating && <span className="show-rating">★ {show.rating.toFixed(1)}</span>}
      </div>
      <div className="show-content">
        <p className="show-year">{year} <span>{show.mediaType === 'movie' ? 'MOVIE' : 'TV SERIES'}</span></p>
        <h2>{show.title}</h2>
        <p className="show-overview">{show.overview || 'No description is available for this show yet.'}</p>
        <div className="show-providers">
          {hasProviders ? (
            <>
              <ProviderGroup title="Included with subscription" providers={show.providers.subscription} kind="subscription" />
              <ProviderGroup title="Free" providers={show.providers.free} kind="free" />
              <ProviderGroup title="Free with ads" providers={show.providers.adSupported} kind="ads" />
            </>
          ) : <p className="no-providers">No free or subscription streaming options are listed for this region.</p>}
        </div>
        {show.providers.link && (
          <a className="availability-link" href={show.providers.link} target="_blank" rel="noreferrer">
            View availability <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}

export default ShowCard;
