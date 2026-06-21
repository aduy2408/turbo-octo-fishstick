// Global UI utilities

function renderTypeBadge(type, extra) {
    const c = TYPE_COLORS[type] || { bg: '#888', text: '#fff' };
    const typeId = TYPE_IDS[type] || 1;
    // Check if local icon exists (assuming download script works)
    const iconUrl = `assets/types/${typeId}.png`;
    return `
    <span class="type-badge" style="background:${c.bg};color:${c.text};display:inline-flex;align-items:center;gap:4px;">
        <img src="${iconUrl}" style="height:12px;width:auto;" alt="${type}" onerror="this.style.display='none'">
        ${type}${extra || ''}
    </span>`;
}

function multLabel(v) {
    if (v === 4) return '×4';
    if (v === 2) return '×2';
    if (v === 0.5) return '×½';
    if (v === 0.25) return '×¼';
    if (v === 0) return '×0';
    return '×' + v;
}

// Tab Switching Logic
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
        const target = btn.dataset.tab;
        document.getElementById(`tab-${target}`).style.display = 'block';

        if (target === 'versus') {
            document.getElementById('score-bar').style.display = 'none';
            if (typeof initVersus === 'function') initVersus();
        } else {
            document.getElementById('score-bar').style.display = 'flex';
        }
    });
});
