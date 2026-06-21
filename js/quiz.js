let state = {
    mode: 'weakness',
    current: null,
    answered: false,
    correct: 0,
    wrong: 0,
    streak: 0,
    total: 0,
    history: [],
};

const MODE_DESCS = {
    weakness: 'Chọn tất cả các hệ có hiệu quả ×2 (hoặc ×4) khi tấn công Pokémon này.',
    resistance: 'Chọn tất cả các hệ có hiệu quả ×0.5 (hoặc ×0.25) khi tấn công Pokémon này.',
    immunity: 'Chọn tất cả các hệ không gây sát thương (×0) cho Pokémon này.',
    all: 'Tick hệ tương ứng: ×4 / ×2 / ×0.5 / ×0.25 / ×0. Bonus: đúng multiplier!'
};

function getCorrectTypes(eff, mode) {
    if (mode === 'weakness') return ALL_TYPES.filter(t => eff[t] > 1);
    if (mode === 'resistance') return ALL_TYPES.filter(t => eff[t] < 1 && eff[t] > 0);
    if (mode === 'immunity') return ALL_TYPES.filter(t => eff[t] === 0);
    if (mode === 'all') return ALL_TYPES.filter(t => eff[t] !== 1);
    return [];
}

function randomPokemon() {
    return POKEMON[Math.floor(Math.random() * POKEMON.length)];
}

function buildTypeGrid(disabled) {
    const grid = document.getElementById('type-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (const t of ALL_TYPES) {
        const c = TYPE_COLORS[t];
        const div = document.createElement('label');
        div.className = 'type-check';
        div.innerHTML = `
<input type="checkbox" value="${t}" id="chk_${t}" ${disabled ? 'disabled' : ''}>
<div class="type-label" id="lbl_${t}" style="background:${c.bg};color:${c.text}">
${t}
</div>`;
        grid.appendChild(div);
    }
    // sync checkbox -> label
    for (const t of ALL_TYPES) {
        const inp = document.getElementById('chk_' + t);
        const lbl = document.getElementById('lbl_' + t);
        inp.addEventListener('change', () => {
            lbl.style.outline = inp.checked ? '2px solid #fff' : 'none';
        });
    }
}

async function nextPokemon() {
    state.answered = false;
    
    // Loading state
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('next-btn').disabled = true;
    document.getElementById('poke-name').textContent = 'Loading...';
    document.getElementById('poke-sprite').style.opacity = '0.5';

    // Now using locally cached POKEMON data!
    let poke = randomPokemon();
    poke.spriteUrl = `assets/pokemon/${poke.id}.png`; // Try local first

    state.current = poke;
    state.total++;

    // sprite
    const spriteEl = document.getElementById('poke-sprite');
    spriteEl.src = poke.spriteUrl;
    spriteEl.onerror = function () {
        // Fallback to github url if not downloaded yet
        this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png`;
        this.onerror = function() {
            this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`;
        };
    };
    spriteEl.style.opacity = '1';

    document.getElementById('poke-num').textContent = '#' + String(poke.id).padStart(3, '0');
    document.getElementById('poke-name').textContent = poke.name;

    // type badges
    const typesEl = document.getElementById('poke-types');
    typesEl.innerHTML = poke.types.map(t => renderTypeBadge(t)).join('');

    // question
    const qEl = document.getElementById('question-text');
    const modeLabel = { weakness: 'điểm yếu (×2 hoặc ×4)', resistance: 'kháng (×0.5 hoặc ×0.25)', immunity: 'miễn nhiễm (×0)', all: 'hiệu quả khác 1' };
    qEl.innerHTML = `<strong>${poke.name}</strong> có <strong>${modeLabel[state.mode]}</strong> với những hệ nào?`;

    buildTypeGrid(false);
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('eff-table').className = 'eff-table';
    
    document.getElementById('submit-btn').style.display = '';
    document.getElementById('submit-btn').disabled = false;
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('next-btn').disabled = false;
    document.getElementById('hint-btn').textContent = '💡 Gợi ý';
    updateProgress();
}

function submitAnswer() {
    if (state.answered) return;
    state.answered = true;

    const poke = state.current;
    const eff = getEffectiveness(ALL_TYPES, poke.types);
    const correct = new Set(getCorrectTypes(eff, state.mode));
    const selected = new Set(
        Array.from(document.querySelectorAll('#type-grid input:checked')).map(i => i.value)
    );

    // Disable all checkboxes
    document.querySelectorAll('#type-grid input').forEach(i => i.disabled = true);

    // Color labels
    for (const t of ALL_TYPES) {
        const lbl = document.getElementById('lbl_' + t);
        lbl.classList.remove('result-correct', 'result-wrong', 'result-missed');
        if (selected.has(t) && correct.has(t)) lbl.classList.add('result-correct');
        else if (selected.has(t) && !correct.has(t)) lbl.classList.add('result-wrong');
        else if (!selected.has(t) && correct.has(t)) lbl.classList.add('result-missed');
    }

    const truePos = [...selected].filter(t => correct.has(t)).length;
    const falsePos = [...selected].filter(t => !correct.has(t)).length;
    const falseNeg = [...correct].filter(t => !selected.has(t)).length;
    const isPerfect = falsePos === 0 && falseNeg === 0;
    const isPartial = truePos > 0 && (falsePos > 0 || falseNeg > 0);

    if (isPerfect) {
        state.correct++;
        state.streak++;
    } else {
        state.wrong++;
        state.streak = 0;
    }

    // Feedback
    const fb = document.getElementById('feedback');
    if (isPerfect) {
        fb.className = 'feedback show correct';
        fb.innerHTML = `<div class="result-headline">✅ Hoàn hảo! +1 điểm</div>
${correct.size === 0 ? 'Không có hệ nào thỏa điều kiện cho Pokémon này.' :
                'Đúng hết: ' + [...correct].map(t => renderTypeBadge(t, state.mode === 'all' ? ' ×' + multLabel(eff[t]) : '')).join('')}`;
    } else if (correct.size === 0 && selected.size === 0) {
        state.correct++; state.wrong--;
        fb.className = 'feedback show correct';
        fb.innerHTML = '<div class="result-headline">✅ Đúng! Không có hệ nào thỏa điều kiện.</div>';
    } else {
        fb.className = 'feedback show ' + (isPartial ? 'partial' : 'wrong');
        const lines = [];
        if (falsePos > 0) lines.push('❌ Chọn sai: ' + [...selected].filter(t => !correct.has(t)).map(t => renderTypeBadge(t)).join(''));
        if (falseNeg > 0) lines.push('⚠️ Bỏ sót: ' + [...correct].filter(t => !selected.has(t)).map(t => renderTypeBadge(t, state.mode === 'all' ? ' ×' + multLabel(eff[t]) : '')).join(''));
        if (truePos > 0) lines.push('✅ Đúng: ' + [...selected].filter(t => correct.has(t)).map(t => renderTypeBadge(t)).join(''));
        fb.innerHTML = `<div class="result-headline">${isPerfect ? '✅' : isPartial ? '⚠️ Gần đúng' : '❌ Sai'}</div>${lines.join('<br>')}`;
    }

    // Show effectiveness table for "all" mode or always
    if (state.mode === 'all') showEffTable(eff);

    updateScore();
    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = '';
}

function showEffTable(eff) {
    const groups = { 4: [], 2: [], 0.5: [], 0.25: [], 0: [], 1: [] };
    for (const t of ALL_TYPES) {
        const v = eff[t];
        if (groups[v]) groups[v].push(t);
        else groups[1].push(t);
    }
    const colors = { 4: '#e25c5c', 2: '#f5a623', 0.5: '#4caf88', 0.25: '#4c9baf', 0: '#7c6df8', 1: 'var(--muted)' };
    
    const pokeTypesStr = state.current.types.map(t => renderTypeBadge(t)).join(' ');
    
    let html = '';
    const order = [4, 2, 1, 0.5, 0.25, 0];
    for (const val of order) {
        const types = groups[val];
        if (!types || types.length === 0) continue;
        
        html += `<div style="margin-bottom:0.8rem;">
            <div style="color:${colors[val]}; font-weight:bold; margin-bottom:0.3rem; font-size:0.9rem;">Sát thương ×${val}:</div>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center; background:var(--surface); padding:0.8rem; border-radius:8px; border-left:3px solid ${colors[val]};">
                <span style="display:flex; gap:0.3rem; flex-wrap:wrap;">${types.map(t => renderTypeBadge(t)).join('')}</span>
                <span style="color:var(--muted); font-size:1.1rem; font-weight:bold; margin: 0 0.5rem;">➔</span>
                <span style="display:flex; gap:0.3rem;">${pokeTypesStr}</span>
                <strong style="margin-left:auto; color:${colors[val]}; font-size:1.1rem;">×${val}</strong>
            </div>
        </div>`;
    }
    const el = document.getElementById('eff-table');
    el.innerHTML = html;
    el.className = 'eff-table show';
}

function showHint() {
    if (state.answered) return;
    const poke = state.current;
    const eff = getEffectiveness(ALL_TYPES, poke.types);
    showEffTable(eff);
    document.getElementById('hint-btn').textContent = '👁 Đang xem gợi ý';
}

function updateScore() {
    document.getElementById('s-correct').textContent = state.correct;
    document.getElementById('s-wrong').textContent = state.wrong;
    document.getElementById('s-streak').textContent = state.streak;
    const total = state.correct + state.wrong;
    document.getElementById('s-acc').textContent = total > 0 ? Math.round(state.correct / total * 100) + '%' : '—';
}

function updateProgress() {
    const total = state.correct + state.wrong;
    const pct = total > 0 ? Math.round(state.correct / total * 100) : 0;
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-text').textContent = `${state.correct} đúng / ${total} câu`;
}

// Mode buttons
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.mode = btn.dataset.mode;
        document.getElementById('mode-desc').textContent = MODE_DESCS[state.mode];
        nextPokemon();
    });
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    const md = document.getElementById('mode-desc');
    if(md) md.textContent = MODE_DESCS[state.mode];
    nextPokemon();
    updateScore();
});