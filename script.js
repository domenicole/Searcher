async function search() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsDiv = document.getElementById('results');
    const infoDiv = document.getElementById('resultsInfo');
    
    if (!query) {
        alert('Por favor ingresa un término de búsqueda');
        return;
    }

    resultsDiv.innerHTML = '<div class="loading">Cargando resultados...</div>';
    infoDiv.innerHTML = '';

    try {
        const response = await fetch(`https://api.plos.org/search?q=${encodeURIComponent(query)}&fl=id,title,journal,publication_date,article_type,author,abstract,score&rows=20&wt=json`);
        
        if (!response.ok) {
            throw new Error('Error en la búsqueda');
        }

        const data = await response.json();
        const docs = data.response.docs;
        const total = data.response.numFound;

        if (docs.length === 0) {
            resultsDiv.innerHTML = '<div class="error">No se encontraron resultados</div>';
            return;
        }

        infoDiv.innerHTML = `Resultados encontrados: ${total} | Mostrando página 1 de ${Math.ceil(total / 20)}`;

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Título</th>
                        <th>Journal</th>
                        <th>Fecha de Publicación</th>
                        <th>Tipo de Artículo</th>
                        <th>Autores</th>
                        <th>Abstract</th>
                        <th>Score</th>
                        <th>DOI</th>
                    </tr>
                </thead>
                <tbody>
        `;

        docs.forEach((doc, index) => {
            const authors = doc.author ? doc.author.slice(0, 3).join(', ') : 'N/A';
            const abstract = doc.abstract ? doc.abstract[0].substring(0, 150) + '...' : '...';
            const doi = doc.id || 'N/A';
            const score = doc.score ? doc.score.toFixed(2) : 'N/A';
            const date = doc.publication_date ? new Date(doc.publication_date).toLocaleDateString('es-ES') : 'N/A';
            
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${doc.title || 'Sin título'}</strong></td>
                    <td>${doc.journal || 'N/A'}</td>
                    <td>${date}</td>
                    <td>${doc.article_type || 'N/A'}</td>
                    <td>${authors}</td>
                    <td class="abstract">${abstract}</td>
                    <td class="score">${score}</td>
                    <td><a href="https://doi.org/${doi}" target="_blank">${doi}</a></td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        resultsDiv.innerHTML = tableHTML;

    } catch (error) {
        resultsDiv.innerHTML = `<div class="error">Error al cargar los resultados: ${error.message}</div>`;
    }
}

// Buscar al presionar Enter
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        search();
    }
});

// Búsqueda inicial
search();