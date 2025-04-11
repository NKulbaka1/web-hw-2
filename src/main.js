document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const resultsDiv = document.getElementById('results');
  const bookDetailsDiv = document.getElementById('book-details');

  searchBtn.addEventListener('click', searchBooks);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBooks();
  });

  async function searchBooks() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      displayResults(data.docs);
    } catch (error) {
      console.error('Error fetching books:', error);
      resultsDiv.innerHTML = '<p>Error loading books. Please try again.</p>';
    }
  }

  function displayResults(books) {
    resultsDiv.innerHTML = '';
    bookDetailsDiv.classList.add('hidden');

    if (!books || books.length === 0) {
      resultsDiv.innerHTML = '<p>No books found. Try another search.</p>';
      return;
    }

    books.slice(0, 12).forEach(book => {
      const bookCard = document.createElement('div');
      bookCard.className = 'book-card';
      bookCard.innerHTML = `
        <h3>${book.title}</h3>
        ${book.author_name ? `<p>by ${book.author_name.join(', ')}</p>` : ''}
        ${book.first_publish_year ? `<p>First published: ${book.first_publish_year}</p>` : ''}
      `;
      
      if (book.cover_i) {
        bookCard.innerHTML += `<img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="${book.title} cover">`;
      } else {
        bookCard.innerHTML += '<div class="no-cover">No cover available</div>';
      }

      bookCard.addEventListener('click', () => showBookDetails(book));
      resultsDiv.appendChild(bookCard);
    });
  }

  async function showBookDetails(book) {
    resultsDiv.classList.add('hidden');
    bookDetailsDiv.classList.remove('hidden');

    let detailsHTML = `
      <button class="back-btn" id="back-btn">Back to results</button>
      <h2>${book.title}</h2>
      ${book.author_name ? `<p><strong>Author(s):</strong> ${book.author_name.join(', ')}</p>` : ''}
      ${book.first_publish_year ? `<p><strong>First published:</strong> ${book.first_publish_year}</p>` : ''}
      ${book.publisher ? `<p><strong>Publisher(s):</strong> ${Array.isArray(book.publisher) ? book.publisher.join(', ') : book.publisher}</p>` : ''}
    `;

    if (book.cover_i) {
      detailsHTML += `<img src="https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg" alt="${book.title} cover" style="max-width: 200px; float: left; margin-right: 20px; margin-bottom: 20px;">`;
    }

    if (book.key) {
      try {
        const response = await fetch(`https://openlibrary.org${book.key}.json`);
        const bookData = await response.json();
        
        if (bookData.description) {
          const description = typeof bookData.description === 'string' 
            ? bookData.description 
            : bookData.description.value || 'No description available';
          detailsHTML += `<p><strong>Description:</strong> ${description}</p>`;
        }
        
        if (bookData.subjects) {
          detailsHTML += `<p><strong>Subjects:</strong> ${bookData.subjects.join(', ')}</p>`;
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
      }
    }

    bookDetailsDiv.innerHTML = detailsHTML;

    document.getElementById('back-btn').addEventListener('click', () => {
      resultsDiv.classList.remove('hidden');
      bookDetailsDiv.classList.add('hidden');
    });
  }
});