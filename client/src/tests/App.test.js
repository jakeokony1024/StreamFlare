import { act, fireEvent, render, screen } from '../testUtils';
import axios from 'axios';
import App from '../App';

jest.mock('axios', () => ({
  get: jest.fn(),
  isCancel: jest.fn(),
}));

const show = {
  id: 1,
  mediaType: 'tv',
  title: 'Example Show',
  overview: 'A sample description.',
  releaseDate: '2024-01-01',
  rating: 8.2,
  poster: null,
  providers: { subscription: [], free: [], adSupported: [], link: null },
};

beforeEach(() => {
  axios.get.mockResolvedValue({ data: { results: [show] } });
  axios.isCancel.mockReturnValue(false);
});

test('loads shows and updates the API query when a search is submitted', async () => {
  render(<App />);

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(screen.getByRole('heading', { name: 'Example Show' })).toBeTruthy();
  expect(axios.get).toHaveBeenLastCalledWith('/api/shows', expect.objectContaining({
    params: { region: 'US', q: '' },
  }));

  fireEvent.change(screen.getByRole('textbox', { name: 'Search movies and TV shows' }), {
    target: { value: '  Example  ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(axios.get).toHaveBeenLastCalledWith('/api/shows', expect.objectContaining({
    params: { region: 'US', q: 'Example' },
  }));
  expect(screen.getByRole('heading', { name: 'Results for “Example”' })).toBeTruthy();
});
