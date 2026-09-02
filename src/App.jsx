import { useState } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchBooks = async () => {
    // Empty search check
    if (!query.trim()) {
      setError("Please enter a book name.");
      setBooks([]);
      return;
    }

    // Prevent multiple requests
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setBooks([]);

    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query.trim()
      )}&maxResults=10`;

      console.log("Fetching:", url);

      let response;

      // Retry maximum 3 times if 429 occurs
      for (let attempt = 0; attempt < 3; attempt++) {
        response = await fetch(url);

        console.log("Attempt:", attempt + 1);
        console.log("Status:", response.status);

        // If not 429, stop retrying
        if (response.status !== 429) {
          break;
        }

        // Wait before retry
        if (attempt < 2) {
          const delay = 2000 * (attempt + 1);

          console.log(`Rate limited. Retrying in ${delay / 1000} seconds...`);

          await new Promise((resolve) => {
            setTimeout(resolve, delay);
          });
        }
      }

      // Handle API errors
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Too many requests. Please wait a few seconds and try again."
          );
        }

        if (response.status === 400) {
          throw new Error("Invalid search request.");
        }

        if (response.status === 403) {
          throw new Error(
            "API access denied. Please check your Google Books API settings."
          );
        }

        if (response.status === 404) {
          throw new Error("Books API endpoint not found.");
        }

        if (response.status >= 500) {
          throw new Error(
            "Google Books server is temporarily unavailable."
          );
        }

        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      console.log("API Response:", data);

      // Check books
      if (data.items && data.items.length > 0) {
        setBooks(data.items);
      } else {
        setError("No books found. Try another title or author.");
      }
    } catch (err) {
      console.error("Book search error:", err);

      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Enter key search
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      searchBooks();
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>📚 React Book Finder</h1>

        <p>
          Search millions of books using Google Books
        </p>

        {/* Search Box */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by title, author, or keyword..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);

              // Clear error when user starts typing
              if (error) {
                setError("");
              }
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
            🔍 Searching for books...
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
            <h2>Search Results</h2>

            <div className="book-grid">
              {books.map((book) => {
                const info = book.volumeInfo || {};

                return (
                  <div
                    className="book-card"
                    key={book.id}
                  >
                    {/* Book Cover */}
                    <div className="cover">
                      {info.imageLinks?.thumbnail ? (
                        <img
                          src={info.imageLinks.thumbnail.replace(
                            "http://",
                            "https://"
                          )}
                          alt={info.title || "Book cover"}
                        />
                      ) : (
                        <div className="no-cover">
                          📕
                          <span>No Cover</span>
                        </div>
                      )}
                    </div>

                    {/* Book Information */}
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

        {/* Initial message */}
        {!loading && !error && books.length === 0 && (
          <div className="welcome">
            <div className="welcome-icon">📚</div>

            <h2>Find Your Next Book</h2>

            <p>
              Search for books by title, author, or keyword.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
