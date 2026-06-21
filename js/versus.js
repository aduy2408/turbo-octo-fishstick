// Versus Mode Logic

let vsState = {
    p1: null,
    p2: null,
    p1Atk: null, // result of p1 attacking p2
    p2Atk: null, // result of p2 attacking p1
    answered: false
};

const MULT_OPTIONS = [4, 2, 1, 0.5, 0.25, 0];

function initVersus() {
    const container = document.getElementById('tab-versus');
    
    // Create UI if not exists
    if (!document.getElementById('versus-container')) {
        container.innerHTML = `
            <div id="versus-container" style="display:flex; flex-direction:column; gap:2rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface); padding:2rem; border-radius:20px; border:1px solid var(--border);">
                    
                    <!-- P1 -->
                    <div id="vs-p1" style="display:flex; flex-direction:column; align-items:center; width: 40%;">
                        <img id="p1-sprite" src="" style="width:120px; height:120px; image-rendering:pixelated; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.5));" alt="P1">
                        <div id="p1-num" style="font-size:0.8rem; color:var(--muted); margin-top:0.5rem;"></div>
                        <div id="p1-name" style="font-size:1.5rem; font-weight:bold; margin-bottom:0.5rem;"></div>
                        <div id="p1-types" class="type-badges" style="justify-content:center;"></div>
                    </div>
                    
                    <!-- VS -->
                    <div style="font-size:2.5rem; font-weight:900; color:var(--accent); font-style:italic;">VS</div>
                    
                    <!-- P2 -->
                    <div id="vs-p2" style="display:flex; flex-direction:column; align-items:center; width: 40%;">
                        <img id="p2-sprite" src="" style="width:120px; height:120px; image-rendering:pixelated; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.5)); transform: scaleX(-1);" alt="P2">
                        <div id="p2-num" style="font-size:0.8rem; color:var(--muted); margin-top:0.5rem;"></div>
                        <div id="p2-name" style="font-size:1.5rem; font-weight:bold; margin-bottom:0.5rem;"></div>
                        <div id="p2-types" class="type-badges" style="justify-content:center;"></div>
                    </div>
                </div>

                <!-- Interactive Quiz Area -->
                <div id="vs-quiz-area" style="background:var(--surface2); padding:1.5rem; border-radius:15px; border:1px solid var(--border);">
                    <h3 style="margin-bottom:1rem; text-align:center;">Dự đoán đòn đánh mạnh nhất</h3>
                    
                    <div style="display:flex; justify-content:space-between; gap:2rem;">
                        <!-- P1 Attack Question -->
                        <div style="flex:1;">
                            <div style="margin-bottom:0.5rem; font-size:0.9rem; color:var(--muted);">
                                Khi <strong id="q-p1-name" style="color:var(--text);">P1</strong> tấn công, sát thương cao nhất là bao nhiêu?
                            </div>
                            <div id="p1-mult-options" style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                                ${MULT_OPTIONS.map(m => `
                                    <label class="type-check">
                                        <input type="radio" name="p1-guess" value="${m}">
                                        <div class="type-label" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">×${m}</div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <!-- P2 Attack Question -->
                        <div style="flex:1;">
                            <div style="margin-bottom:0.5rem; font-size:0.9rem; color:var(--muted);">
                                Khi <strong id="q-p2-name" style="color:var(--text);">P2</strong> tấn công, sát thương cao nhất là bao nhiêu?
                            </div>
                            <div id="p2-mult-options" style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                                ${MULT_OPTIONS.map(m => `
                                    <label class="type-check">
                                        <input type="radio" name="p2-guess" value="${m}">
                                        <div class="type-label" style="background:var(--surface); color:var(--text); border:1px solid var(--border);">×${m}</div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div style="text-align:center; margin-top:1.5rem;">
                        <button id="vs-submit-btn" class="btn btn-primary" onclick="submitVersusMatch()" style="font-size: 1.1rem; padding: 0.6rem 2rem;">Xem kết quả</button>
                    </div>
                </div>

                <div id="vs-feedback" style="display:none; padding:1rem; border-radius:10px; text-align:center; font-size:1.1rem; font-weight:bold;"></div>

                <div id="vs-explanation" style="display:none; background:var(--surface2); padding:1.5rem; border-radius:15px; flex-direction:column; gap:1.5rem;">
                </div>

                <div style="text-align:center;">
                    <button id="vs-next-btn" class="btn btn-ghost" onclick="nextVersusMatch()" style="display:none; font-size: 1.1rem; padding: 0.8rem 2rem; background:var(--accent); color:#fff; border:none;">Cặp tiếp theo 🎲</button>
                </div>
            </div>
        `;
        
        // Add click events for custom radio buttons styling
        const setupRadios = (name) => {
            document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
                radio.addEventListener('change', (e) => {
                    document.querySelectorAll(`input[name="${name}"] ~ .type-label`).forEach(lbl => {
                        lbl.style.borderColor = 'var(--border)';
                        lbl.style.background = 'var(--surface)';
                    });
                    if(e.target.checked) {
                        e.target.nextElementSibling.style.borderColor = 'var(--accent)';
                        e.target.nextElementSibling.style.background = 'var(--accent)';
                    }
                });
            });
        };
        setupRadios('p1-guess');
        setupRadios('p2-guess');
        
        nextVersusMatch();
    }
}

function analyzeAttack(attacker, defender) {
    let lines = [];
    let bestMult = -1; // Force finding a mult
    
    for (const atkType of attacker.types) {
        let mult = 1;
        for (const defType of defender.types) {
            const row = typeChart[atkType] || {};
            const m = row[defType] !== undefined ? row[defType] : 1;
            mult *= m;
        }
        if (mult > bestMult) {
            bestMult = mult;
        }
        lines.push(`&nbsp;&nbsp;&nbsp;&nbsp;⚔️ ${renderTypeBadge(atkType)} ➔ ${defender.types.map(t => renderTypeBadge(t)).join(' ')} : <strong>×${mult}</strong>`);
    }
    return { lines, bestMult };
}

function nextVersusMatch() {
    vsState.answered = false;
    vsState.p1 = POKEMON[Math.floor(Math.random() * POKEMON.length)];
    vsState.p2 = POKEMON[Math.floor(Math.random() * POKEMON.length)];
    
    const p1 = vsState.p1;
    const p2 = vsState.p2;

    // Pre-calculate
    vsState.p1Atk = analyzeAttack(p1, p2);
    vsState.p2Atk = analyzeAttack(p2, p1);
    
    // Update UI
    const setupPokemon = (p, prefix) => {
        const spriteEl = document.getElementById(`${prefix}-sprite`);
        spriteEl.src = `assets/pokemon/${p.id}.png`;
        spriteEl.onerror = function() {
            this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
        };
        document.getElementById(`${prefix}-num`).textContent = '#' + String(p.id).padStart(3, '0');
        document.getElementById(`${prefix}-name`).textContent = p.name;
        document.getElementById(`${prefix}-types`).innerHTML = p.types.map(t => renderTypeBadge(t)).join('');
    };
    
    setupPokemon(p1, 'p1');
    setupPokemon(p2, 'p2');
    
    document.getElementById('q-p1-name').textContent = p1.name;
    document.getElementById('q-p2-name').textContent = p2.name;

    // Reset UI state
    document.getElementById('vs-quiz-area').style.display = 'block';
    document.getElementById('vs-feedback').style.display = 'none';
    document.getElementById('vs-explanation').style.display = 'none';
    document.getElementById('vs-submit-btn').style.display = 'inline-block';
    document.getElementById('vs-next-btn').style.display = 'none';

    // Clear radios
    ['p1-guess', 'p2-guess'].forEach(name => {
        document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
            radio.checked = false;
            radio.disabled = false;
            radio.nextElementSibling.style.borderColor = 'var(--border)';
            radio.nextElementSibling.style.background = 'var(--surface)';
        });
    });
}

function submitVersusMatch() {
    if (vsState.answered) return;
    
    const p1GuessEl = document.querySelector('input[name="p1-guess"]:checked');
    const p2GuessEl = document.querySelector('input[name="p2-guess"]:checked');
    
    if (!p1GuessEl || !p2GuessEl) {
        alert("Vui lòng chọn dự đoán cho cả hai bên!");
        return;
    }

    vsState.answered = true;
    
    const p1Guess = parseFloat(p1GuessEl.value);
    const p2Guess = parseFloat(p2GuessEl.value);
    
    const p1Actual = vsState.p1Atk.bestMult;
    const p2Actual = vsState.p2Atk.bestMult;

    const p1Correct = p1Guess === p1Actual;
    const p2Correct = p2Guess === p2Actual;

    // Lock radios
    ['p1-guess', 'p2-guess'].forEach(name => {
        document.querySelectorAll(`input[name="${name}"]`).forEach(radio => radio.disabled = true);
    });

    // Feedback
    const fb = document.getElementById('vs-feedback');
    fb.style.display = 'block';
    if (p1Correct && p2Correct) {
        fb.style.background = 'rgba(76, 175, 136, 0.2)';
        fb.style.color = 'var(--correct)';
        fb.innerHTML = '🎉 Tuyệt vời! Bạn đã đoán đúng cả hai!';
    } else if (p1Correct || p2Correct) {
        fb.style.background = 'rgba(245, 166, 35, 0.2)';
        fb.style.color = '#f5a623';
        fb.innerHTML = '⚠️ Gần đúng! Bạn đoán đúng 1 bên.';
    } else {
        fb.style.background = 'rgba(226, 92, 92, 0.2)';
        fb.style.color = 'var(--wrong)';
        fb.innerHTML = '❌ Sai rồi! Xem giải thích bên dưới nhé.';
    }

    // Explanation
    const expl = document.getElementById('vs-explanation');
    expl.style.display = 'flex';
    
    const p1 = vsState.p1;
    const p2 = vsState.p2;
    const p1Atk = vsState.p1Atk;
    const p2Atk = vsState.p2Atk;

    const getAdvantageText = () => {
        if (p1Atk.bestMult > p2Atk.bestMult) {
            return `Lợi thế nghiêng về <strong>${p1.name}</strong> (Sát thương tối đa ×${p1Atk.bestMult} so với ×${p2Atk.bestMult})`;
        } else if (p2Atk.bestMult > p1Atk.bestMult) {
            return `Lợi thế nghiêng về <strong>${p2.name}</strong> (Sát thương tối đa ×${p2Atk.bestMult} so với ×${p1Atk.bestMult})`;
        } else {
            return `Kèo cân bằng! (Cả hai đều có thể gây sát thương tối đa ×${p1Atk.bestMult})`;
        }
    };

    expl.innerHTML = `
        <div>
            <h3 style="color:${p1Correct ? 'var(--correct)' : 'var(--wrong)'}; margin-bottom:0.5rem; font-size:1.1rem;">
                ${p1Correct ? '✅' : '❌'} Khi ${p1.name} tấn công (Max ×${p1Atk.bestMult}):
            </h3>
            <div style="color:var(--text); font-size:0.95rem; line-height:2.0; margin-top:0.5rem;">
                ${p1Atk.lines.join('<br>')}
            </div>
        </div>
        <hr style="border:none; border-top:1px solid var(--border);">
        <div>
            <h3 style="color:${p2Correct ? 'var(--correct)' : 'var(--wrong)'}; margin-bottom:0.5rem; font-size:1.1rem;">
                ${p2Correct ? '✅' : '❌'} Khi ${p2.name} tấn công (Max ×${p2Atk.bestMult}):
            </h3>
            <div style="color:var(--text); font-size:0.95rem; line-height:2.0; margin-top:0.5rem;">
                ${p2Atk.lines.join('<br>')}
            </div>
        </div>
        <hr style="border:none; border-top:1px solid var(--border);">
        <div style="background:var(--surface); padding:1rem; border-radius:10px; text-align:center; font-size:1.1rem; border-left:4px solid var(--accent);">
            🏆 <strong>Đánh giá chung:</strong> ${getAdvantageText()}
        </div>
    `;

    document.getElementById('vs-submit-btn').style.display = 'none';
    document.getElementById('vs-next-btn').style.display = 'inline-block';
}
