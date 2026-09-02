import { useState } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchBooks = async () => {
    const searchQuery = query.trim();

    if (!searchQuery) {
      setError("Please enter a book name.");
      setBooks([]);
      return;
    }

    if (loading) return;

    setLoading(true);
    setError("");
    setBooks([]);

    try {
      // Open Library API - No API key required
      const url =
        `https://openlibrary.org/search.json` +
        `?q=${encodeURIComponent(searchQuery)}` +
        `&limit=20`;

      console.log("Fetching:", url);

      const response = await fetch(url);

      console.log("Status:", response.status);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      console.log("API Response:", data);

      if (data.docs && data.docs.length > 0) {
        setBooks(data.docs);
      } else {
        setError("No books found.");
      }
    } catch (err) {
      console.error("Book search error:", err);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchBooks();
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>📚 React Book Finder</h1>

        <p>
          Search millions of books using Open Library
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by title, author, or keyword..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={searchBooks}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="container">

        {/* Loading */}
        {loading && (
          <div className="message loading">
            🔍 Searching books...
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="message error">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {!loading && books.length > 0 && (
          <>
            <h2>
              Search Results ({books.length})
            </h2>

            <div className="book-grid">
              {books.map((book, index) => {
                // Open Library cover ID
                const coverId = book.cover_i;

                const coverUrl = coverId
                  ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
                  : null;

                // Authors
                const authors = book.author_name
                  ? book.author_name.join(", ")
                  : "Unknown Author";

                // First publish year
                const year =
                  book.first_publish_year || null;

                // ISBN
                const isbn =
                  book.isbn?.[0] || null;

                return (
                  <div
                    className="book-card"
                    key={`${book.key}-${index}`}
                  >
                    {/* Cover */}
                    <div className="cover">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={
                            book.title ||
                            "Book cover"
                          }
                          loading="lazy"
                        />
                      ) : (
                        <div className="no-cover">
                          <span>📕</span>
                          <small>No Cover</small>
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="book-info">

                      <h3>
                        {book.title ||
                          "Unknown Title"}
                      </h3>

                      <p className="author">
                        ✍️ {authors}
                      </p>

                      {year && (
                        <p className="date">
                          📅 First Published: {year}
                        </p>
                      )}

                      {book.edition_count && (
                        <p className="edition">
                          📖 Editions:{" "}
                          {book.edition_count}
                        </p>
                      )}

                      {isbn && (
                        <p className="isbn">
                          🔢 ISBN: {isbn}
                        </p>
                      )}

                      {/* Subjects */}
                      {book.subject && (
                        <div className="subjects">
                          {book.subject
                            .slice(0, 3)
                            .map(
                              (
                                subject,
                                subjectIndex
                              ) => (
                                <span
                                  key={
                                    subjectIndex
                                  }
                                >
                                  {subject}
                                </span>
                              )
                            )}
                        </div>
                      )}

                      {/* Open Library Button */}
                      {book.key && (
                        <a
                          href={`https://openlibrary.org${book.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-button"
                        >
                          View Book →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Welcome */}
        {!loading &&
          !error &&
          books.length === 0 && (
            <div className="welcome">
              <div className="welcome-icon">
                📚
              </div>

              <h2>
                Find Your Next Book
              </h2>

              <p>
                Search by title, author,
                or keyword.
              </p>
            </div>
          )}
      </main>
    </div>
  );
}

export default App;
