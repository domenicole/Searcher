let currentPage = 1;
const resultsPerPage = 20;
let currentQuery = '';
let totalResults = 0;

async function search(page = 1) {
    const query = document.getElementById('searchInput').value.trim();
    const resultsDiv = document.getElementById('results');
    const infoDiv = document.getElementById('resultsInfo');
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }

    currentQuery = query;
    currentPage = page;
    
    resultsDiv.innerHTML = '<div class="loading">Loading results...</div>';
    infoDiv.innerHTML = '';

    try {
        const start = (page - 1) * resultsPerPage;
        const response = await fetch(`https://api.plos.org/search?q=${encodeURIComponent(query)}&fl=id,title,journal,publication_date,article_type,author,score&rows=${resultsPerPage}&start=${start}&wt=json`);
        
        if (!response.ok) {
            throw new Error('Search error');
        }

        const data = await response.json();
        const docs = data.response.docs;
        totalResults = data.response.numFound;
        const totalPages = Math.ceil(totalResults / resultsPerPage);

        if (docs.length === 0) {
            resultsDiv.innerHTML = '<div class="error">No results found</div>';
            return;
        }

        infoDiv.innerHTML = `Results found: ${totalResults} | Showing page ${page} of ${totalPages}`;

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Journal</th>
                        <th>Publication Date</th>
                        <th>Article Type</th>
                        <th>Authors</th>
                        <th>Score</th>
                        <th>DOI</th>
                    </tr>
                </thead>
                <tbody>
        `;

        docs.forEach((doc, index) => {
            const authors = doc.author ? doc.author.slice(0, 3).join(', ') : 'N/A';
            const doi = doc.id || 'N/A';
            const score = doc.score ? doc.score.toFixed(2) : 'N/A';
            const date = doc.publication_date ? new Date(doc.publication_date).toLocaleDateString('en-US') : 'N/A';
            const globalIndex = start + index + 1;
            
            tableHTML += `
                <tr>
                    <td>${globalIndex}</td>
                    <td><strong>${doc.title || 'No title'}</strong></td>
                    <td>${doc.journal || 'N/A'}</td>
                    <td>${date}</td>
                    <td>${doc.article_type || 'N/A'}</td>
                    <td>${authors}</td>
                    <td class="score">${score}</td>
                    <td><a href="https://doi.org/${doi}" target="_blank">${doi}</a></td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        
        // Agregar botones de paginación
        const paginationHTML = createPagination(page, totalPages);
        
        resultsDiv.innerHTML = paginationHTML + tableHTML + paginationHTML;

    } catch (error) {
        resultsDiv.innerHTML = `<div class="error">Error loading results: ${error.message}</div>`;
    }
}

function createPagination(currentPage, totalPages) {
    if (totalPages <= 1) return '';
    
    let paginationHTML = '<div class="pagination">';
    
    // Botón Previous
    if (currentPage > 1) {
        paginationHTML += `<button onclick="search(${currentPage - 1})">Previous</button>`;
    } else {
        paginationHTML += `<button disabled>Previous</button>`;
    }
    
    // Números de página
    paginationHTML += `<span class="page-info">Page ${currentPage} of ${totalPages}</span>`;
    
    // Botón Next
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="search(${currentPage + 1})">Next</button>`;
    } else {
        paginationHTML += `<button disabled>Next</button>`;
    }
    
    paginationHTML += '</div>';
    return paginationHTML;
}

// Buscar al presionar Enter
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        search(1);
    }
});

// Búsqueda inicial
search(1);