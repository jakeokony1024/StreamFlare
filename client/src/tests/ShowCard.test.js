import { render, screen } from '../testUtils';
import ShowCard from '../components/ShowCard';

const show = {
  id: 12,
  mediaType: 'movie',
  title: 'Test Movie',
  overview: 'A movie overview.',
  releaseDate: '2023-08-10',
  rating: 7.5,
  poster: 'https://image.tmdb.org/t/p/w342/poster.jpg',
  providers: {
    subscription: [{ id: 1, name: 'Stream Service', logo: 'https://image.tmdb.org/logo.jpg' }],
    free: [],
    adSupported: [],
    link: 'https://www.themoviedb.org/movie/12/watch',
  },
};

test('renders show details, provider information, and availability link', () => {
  const { container } = render(<ShowCard show={show} />);

  expect(screen.getByRole('heading', { name: 'Test Movie' })).toBeTruthy();
  expect(container.querySelector('.show-year').textContent).toContain('2023');
  expect(container.querySelector('.show-year').textContent).toContain('MOVIE');
  expect(screen.getByText('A movie overview.')).toBeTruthy();
  expect(screen.getByText('Stream Service')).toBeTruthy();
  expect(screen.getByRole('img', { name: 'Test Movie poster' }).getAttribute('src')).toBe(show.poster);
  expect(screen.getByRole('link', { name: /View availability/ }).getAttribute('href')).toBe(show.providers.link);
});

test('shows fallback content when details and providers are missing', () => {
  const { container } = render(<ShowCard show={{
    ...show,
    overview: '',
    releaseDate: null,
    poster: null,
    rating: null,
    providers: { subscription: [], free: [], adSupported: [], link: null },
  }} />);

  expect(container.querySelector('.show-year').textContent).toContain('Year unknown');
  expect(screen.getByText('No description is available for this show yet.')).toBeTruthy();
  expect(screen.getByText('No free or subscription streaming options are listed for this region.')).toBeTruthy();
  expect(screen.getByLabelText('No poster available')).toBeTruthy();
});
