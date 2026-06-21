// Versus Mode Logic

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

                <div style="text-align:center;">
                    <button class="btn btn-primary" onclick="nextVersusMatch()" style="font-size: 1.1rem; padding: 0.8rem 2rem;">Cặp tiếp theo 🎲</button>
                </div>

                <div id="vs-explanation" style="background:var(--surface2); padding:1.5rem; border-radius:15px; display:flex; flex-direction:column; gap:1.5rem;">
                </div>
            </div>
        `;
        nextVersusMatch();
    }
}

function nextVersusMatch() {
    const p1 = POKEMON[Math.floor(Math.random() * POKEMON.length)];
    const p2 = POKEMON[Math.floor(Math.random() * POKEMON.length)];
    
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
    
    // Calculate Matchup
    const expl = document.getElementById('vs-explanation');
    
    const analyzeAttack = (attacker, defender) => {
        let lines = [];
        let bestMult = 0;
        let bestTypes = [];
        
        for (const atkType of attacker.types) {
            let mult = 1;
            for (const defType of defender.types) {
                const row = typeChart[atkType] || {};
                const m = row[defType] !== undefined ? row[defType] : 1;
                mult *= m;
            }
            if (mult > bestMult) {
                bestMult = mult;
                bestTypes = [atkType];
            } else if (mult === bestMult && mult !== 0) {
                bestTypes.push(atkType);
            }
            lines.push(`Hệ ${renderTypeBadge(atkType)} đánh vào ${defender.name} gây <strong>×${mult}</strong> sát thương.`);
        }
        return { lines, bestMult, bestTypes };
    };

    const p1Atk = analyzeAttack(p1, p2);
    const p2Atk = analyzeAttack(p2, p1);

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
            <h3 style="color:var(--correct); margin-bottom:0.5rem; font-size:1.2rem;">⚔️ Khi ${p1.name} tấn công:</h3>
            <div style="color:var(--muted); font-size:0.95rem; line-height:1.8;">
                ${p1Atk.lines.join('<br>')}
            </div>
        </div>
        <hr style="border:none; border-top:1px solid var(--border);">
        <div>
            <h3 style="color:var(--wrong); margin-bottom:0.5rem; font-size:1.2rem;">⚔️ Khi ${p2.name} tấn công:</h3>
            <div style="color:var(--muted); font-size:0.95rem; line-height:1.8;">
                ${p2Atk.lines.join('<br>')}
            </div>
        </div>
        <hr style="border:none; border-top:1px solid var(--border);">
        <div style="background:var(--surface); padding:1rem; border-radius:10px; text-align:center; font-size:1.1rem; border-left:4px solid var(--accent);">
            🏆 <strong>Kết luận:</strong> ${getAdvantageText()}
        </div>
    `;
}
