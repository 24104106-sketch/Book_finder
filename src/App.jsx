import { useState } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchBooks = async () => {
  if (!query.trim()) {
    setError("Please enter a book name.");
    return;
  }

  setLoading(true);
  setError("");
  setBooks([]);

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query.trim()
    )}&maxResults=20`;

    console.log("Fetching:", url);

    const response = await fetch(url);

    console.log("Status:", response.status);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    console.log("API Response:", data);

    if (data.items && data.items.length > 0) {
      setBooks(data.items);
    } else {
      setError("No books found.");
    }
  } catch (err) {
    console.error("Book search error:", err);
    setError(`Something went wrong: ${err.message}`);
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
        <p>Search millions of books using Google Books</p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by title, author, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button onClick={searchBooks}>
            Search
          </button>
        </div>
      </header>

      <main className="container">
        {loading && <div className="message">Loading books...</div>}

        {error && !loading && (
          <div className="message error">{error}</div>
        )}

        {!loading && books.length > 0 && (
          <>
            <h2>Search Results</h2>

            <div className="book-grid">
              {books.map((book) => {
                const info = book.volumeInfo;

                return (
                  <div className="book-card" key={book.id}>
                    <div className="cover">
                      {info.imageLinks?.thumbnail ? (
                        <img
                          src={info.imageLinks.thumbnail}
                          alt={info.title}
                        />
                      ) : (
                        <div className="no-cover">
                          No Cover
                        </div>
                      )}
                    </div>

                    <div className="book-info">
                      <h3>{info.title}</h3>

                      <p className="author">
                        {info.authors
                          ? info.authors.join(", ")
                          : "Unknown Author"}
                      </p>

                      {info.publishedDate && (
                        <p className="date">
                          Published: {info.publishedDate}
                        </p>
                      )}

                      {info.description && (
                        <p className="description">
                          {info.description.length > 150
                            ? info.description.substring(0, 150) + "..."
                            : info.description}
                        </p>
                      )}

                      {info.previewLink && (
                        <a
                          href={info.previewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="view-button"
                        >
                          View Book
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
