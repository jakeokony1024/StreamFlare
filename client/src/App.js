import { useEffect, useState } from 'react';
import axios from 'axios';
import ShowCard from './components/ShowCard';
import SearchBar from './components/SearchBar';
import Footer from './components/Footer';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '';
const REGIONS = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
];

function App() {
  const [region, setRegion] = useState('US');
  const [activeQuery, setActiveQuery] = useState('');
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    axios.get(`${API_URL}/api/shows`, {
      params: { region, q: activeQuery },
      signal: controller.signal,
    })
      .then(({ data }) => setShows(data.results || []))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setShows([]);
        setError(err.response?.data?.message || 'Could not load shows. Check that the server is running and try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [region, activeQuery]);

  return (
    <main className="discover-app">
      <header className="site-header">
        <a className="brand" href="/" aria-label="StreamFlare home">
          <span className="brand-mark">S</span>
          <span>Stream<span>Flare</span></span>
        </a>
        <div className="header-region">
          <label htmlFor="region-select">Streaming in</label>
          <select id="region-select" value={region} onChange={(event) => setRegion(event.target.value)}>
            {REGIONS.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
        </div>
      </header>

      <section className="discover-hero">
        <p className="hero-eyebrow">FIND YOUR NEXT SHOW</p>
        <h1>Great shows.<br /><span>Know where to watch.</span></h1>
        <p className="hero-copy">Browse popular TV or search movies and shows to find where they’re streaming in your region.</p>
        <SearchBar onSearch={setActiveQuery} />
      </section>

      <section className="results-section" aria-live="polite">
        <div className="results-heading">
          <div>
            <p className="results-kicker">{activeQuery ? 'SEARCH RESULTS' : 'WHAT EVERYONE IS WATCHING'}</p>
            <h2>{activeQuery ? `Results for “${activeQuery}”` : 'Popular TV shows'}</h2>
          </div>
          {!loading && <span className="result-count">{shows.length} {shows.length === 1 ? 'show' : 'shows'}</span>}
        </div>

        {loading && <div className="show-grid" aria-label="Loading shows">{Array.from({ length: 8 }, (_, index) => <div className="show-skeleton" key={index} />)}</div>}
        {!loading && error && <div className="feedback-panel" role="alert"><span className="feedback-icon">!</span><p>{error}</p></div>}
        {!loading && !error && shows.length > 0 && <div className="show-grid">{shows.map((show) => <ShowCard key={show.id} show={show} />)}</div>}
        {!loading && !error && shows.length === 0 && <div className="feedback-panel"><span className="feedback-icon">⌕</span><p>No shows found. Try another title.</p></div>}
      </section>

      <Footer />
    </main>
  );
}

export default App;
