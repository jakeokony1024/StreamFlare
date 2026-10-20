import { fireEvent, render, screen } from '../testUtils';
import SearchBar from '../components/SearchBar';

test('submits a trimmed query', () => {
  const onSearch = jest.fn();
  render(<SearchBar onSearch={onSearch} />);

  fireEvent.change(screen.getByRole('textbox', { name: 'Search movies and TV shows' }), {
    target: { value: '  The Bear  ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  expect(onSearch).toHaveBeenCalledWith('The Bear');
});

test('clears the input and submits an empty query', () => {
  const onSearch = jest.fn();
  render(<SearchBar onSearch={onSearch} />);
  const input = screen.getByRole('textbox', { name: 'Search movies and TV shows' });

  fireEvent.change(input, { target: { value: 'The Bear' } });
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));

  expect(input.value).toBe('');
  expect(onSearch).toHaveBeenLastCalledWith('');
});
