import { useState } from 'react';

function SearchBar({ onSearch }) {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    onSearch('');
  };

  return (
    <form className="show-search" onSubmit={handleSubmit} role="search">
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input
        type="text"
        inputMode="search"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Search movies and TV shows"
        aria-label="Search movies and TV shows"
      />
      {searchInput && <button className="clear-search" type="button" onClick={clearSearch} aria-label="Clear search">×</button>}
      <button className="search-button" type="submit">Search</button>
    </form>
  );
}

export default SearchBar;
