import { render, screen } from '../testUtils';
import Footer from '../components/Footer';

test('renders data attribution and TMDB link', () => {
  render(<Footer />);

  expect(screen.getByText('Streaming availability provided by JustWatch.')).toBeTruthy();
  expect(screen.getByText('This product uses the TMDB API but is not endorsed or certified by TMDB.')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'The Movie Database' }).getAttribute('href')).toBe('https://www.themoviedb.org');
});
