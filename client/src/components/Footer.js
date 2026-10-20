import tmdbLogo from '../assets/tmdb-logo.svg';

function Footer() {
  return (
    <footer className="credits" aria-label="About the data">
      <div className="credits-copy">
        <p>Streaming availability provided by JustWatch.</p>
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </div>
      <a className="tmdb-credit" href="https://www.themoviedb.org" target="_blank" rel="noreferrer" aria-label="The Movie Database">
        <img src={tmdbLogo} alt="The Movie Database" />
      </a>
    </footer>
  );
}

export default Footer;
