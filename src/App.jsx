import { useState } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchBooks = async () => {
    const search = query.trim();

    if (!search) {
      setError("Please enter a book name.");
      return;
    }

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const url =
        `https://www.googleapis.com/books/v1/volumes` +
        `?q=${encodeURIComponent(search)}` +
        `&maxResults=10`;

      const response = await fetch(url);

      if (response.status === 429) {
        setError(
          "Google Books is temporarily rate-limiting requests. Please wait 1–2 minutes and try again."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.items?.length) {
        setBooks(data.items);
      } else {
        setBooks([]);
        setError("No books found.");
      }
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong. Please try again later."
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
      <header className="header">
        <h1>📚 React Book Finder</h1>

        <p>
          Search books without an API key
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

      <main className="container">

        {loading && (
          <div className="message loading">
            🔍 Searching books...
          </div>
        )}

        {error && !loading && (
          <div className="message error">
            ⚠️ {error}
          </div>
        )}

        {!loading && books.length > 0 && (
          <>
            <h2>Search Results</h2>

            <div className="book-grid">
              {books.map((book) => {
                const info = book.volumeInfo || {};

                return (
                  <div
                    className="book-card"
                    key={book.id}
                  >
                    <div className="cover">
                      {info.imageLinks?.thumbnail ? (
                        <img
                          src={info.imageLinks.thumbnail.replace(
                            "http://",
                            "https://"
                          )}
                          alt={info.title}
                        />
                      ) : (
                        <div className="no-cover">
                          📕
                          <span>No Cover</span>
                        </div>
                      )}
                    </div>

                    <div className="book-info">
                      <h3>
                        {info.title || "Unknown Title"}
                      </h3>

                      <p className="author">
                        ✍️{" "}
                        {info.authors
                          ? info.authors.join(", ")
                          : "Unknown Author"}
                      </p>

                      {info.publishedDate && (
                        <p className="date">
                          📅 Published: {info.publishedDate}
                        </p>
                      )}

                      {info.publisher && (
                        <p className="publisher">
                          🏢 {info.publisher}
                        </p>
                      )}

                      {info.description && (
                        <p className="description">
                          {info.description.length > 150
                            ? info.description.substring(0, 150) +
                              "..."
                            : info.description}
                        </p>
                      )}

                      {info.previewLink && (
                        <a
                          href={info.previewLink}
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

        {!loading &&
          !error &&
          books.length === 0 && (
            <div className="welcome">
              <div className="welcome-icon">
                📚
              </div>

              <h2>Find Your Next Book</h2>

              <p>
                Enter a title, author, or keyword
                to search.
              </p>
            </div>
          )}
      </main>
    </div>
  );
}

export default App;
