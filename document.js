  const DOC_FOLDER  = 'documents';
  const PRES_FOLDER = 'presentations';
 
  function getExt(filename) {
    return filename.split('.').pop().toUpperCase();
  }
 
  function buildCard(file, folder, type) {
    const url  = `${folder}/${file.name}`;
    const name = file.name.replace(/\.[^/.]+$/, '');
    const card = document.createElement('a');
    card.href = url;
    card.className = `file-card file-${type}-card`;
    card.dataset.name = file.name;
    card.innerHTML = `
      <div class="file-card-type"><span class="file-card-type-dot"></span>${getExt(file.name)}</div>
      <div class="file-card-top">
        <span class="file-icon">📄</span>
        <div class="file-card-name">${name}</div>
      </div>
      <div class="file-card-meta">${file.size}  · ${file.date}</div>
      <a href="${url}"download class="file-card-download" title="Download">↓</a>
    `;
    return card;
  }
 
  async function loadFolder(folder, containerId, countId, type) {
    const container = document.getElementById(containerId);
    const countEl   = document.getElementById(countId);
    try {
      const res   = await fetch(`${folder}/index.json`);
      const files = await res.json();
      files.forEach(file => container.appendChild(buildCard(file, folder, type)));
      countEl.textContent = files.length + ' file' + (files.length !== 1 ? 's' : '');
    } catch (e) {
      container.innerHTML = '<p style="color:var(--muted);font-size:.85rem">Could not load files.</p>';
      countEl.textContent = '0 files';
    }
  }
 
  async function loadFiles() {
    await Promise.all([
      loadFolder(DOC_FOLDER, 'doc-cards', 'doc-count', 'doc'),
      loadFolder(PRES_FOLDER, 'pres-cards', 'pres-count', 'pres'),
    ]);
  }
 
  loadFiles();


function filterCards(query) {
    const q = query.toLowerCase().trim();
 
    ['doc-cards', 'pres-cards'].forEach(id => {
      const container = document.getElementById(id);
      const cards = container.querySelectorAll('.file-card');
      let visible = 0;
      cards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        const show = !q || name.includes(q);
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      const countId = id === 'doc-cards' ? 'doc-count' : 'pres-count';
      document.getElementById(countId).textContent = visible + ' file' + (visible !== 1 ? 's' : '');
    });
  }

