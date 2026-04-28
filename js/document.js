const DOC_FOLDER  = 'documents';
const PRES_FOLDER = 'presentations';

function getExt(filename) {
  return filename.split('.').pop().toUpperCase();
}

function buildCard(file, folder, type) {
  const url  = `${folder}/${file.name}`;
  const name = file.name.replace(/\.[^/.]+$/, '');
  const ext  = getExt(file.name);
  const card = document.createElement('a');
  card.href = url;
  card.target = '_blank';
  card.className = `file-card file-${type}-card`;
  card.dataset.name = file.name;
  card.dataset.ext  = ext;
  card.innerHTML = `
    <div class="file-card-type"><span class="file-card-type-dot"></span>${ext}</div>
    <div class="file-card-top">
      <span class="fiv-hct fiv-icon-${ext.toLowerCase()} file-icon"></span>
      <div class="file-card-name">${name.replaceAll('_', ' ')}</div>
    </div>
    <div class="file-card-meta">${file.size} · ${file.date}</div>
    <a href="${url}" target="_blank" class="file-card-download" title="Download">↓</a>
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

function buildTagFilters() {
  const container = document.getElementById('file-tag-filters');
  if (!container) return;

  const exts = new Set();
  document.querySelectorAll('.file-card[data-ext]').forEach(card => {
    exts.add(card.dataset.ext);
  });

  const allBtn = document.createElement('button');
  allBtn.className = 'file-tag-filter-btn active';
  allBtn.dataset.ext = '';
  allBtn.textContent = 'All';
  container.appendChild(allBtn);

  [...exts].sort().forEach(ext => {
    const btn = document.createElement('button');
    btn.className = 'file-tag-filter-btn';
    btn.dataset.ext = ext;
    btn.textContent = ext;
    container.appendChild(btn);
  });

  container.addEventListener('click', e => {
    const btn = e.target.closest('.file-tag-filter-btn');
    if (!btn) return;
    container.querySelectorAll('.file-tag-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const query = document.getElementById('search-input')?.value ?? '';
    filterCards(query, btn.dataset.ext);
  });
}

async function loadFiles() {
  await Promise.all([
    loadFolder(DOC_FOLDER,  'doc-cards',  'doc-count',  'doc'),
    loadFolder(PRES_FOLDER, 'pres-cards', 'pres-count', 'pres'),
  ]);
  buildTagFilters();
}

loadFiles();


function filterCards(query, ext = '') {
  const normalize = s => s.replaceAll(' ', '_').toLowerCase().trim();
  const q         = normalize(query);
  const activeExt = ext.toUpperCase();

  ['doc-cards', 'pres-cards'].forEach(id => {
    const container = document.getElementById(id);
    const cards     = container.querySelectorAll('.file-card');
    let visible = 0;

    cards.forEach(card => {
      const nameMatch = !q || card.dataset.name.toLowerCase().includes(q);
      const extMatch  = !activeExt || card.dataset.ext === activeExt;
      const show      = nameMatch && extMatch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    const countId = id === 'doc-cards' ? 'doc-count' : 'pres-count';
    document.getElementById(countId).textContent =
      visible + ' file' + (visible !== 1 ? 's' : '');
  });
}
