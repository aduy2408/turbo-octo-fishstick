import json

with open('pokemon_data.json', 'r') as f:
    pkm_data = json.load(f)

js_content = """// ============ TYPE COLORS ============
const TYPE_COLORS = {
    Normal: { bg: '#A8A878', text: '#3d3a2a' },
    Fire: { bg: '#F08030', text: '#4a2200' },
    Water: { bg: '#6890F0', text: '#0d1f5c' },
    Electric: { bg: '#F8D030', text: '#4a3a00' },
    Grass: { bg: '#78C850', text: '#1a3d00' },
    Ice: { bg: '#98D8D8', text: '#1a4040' },
    Fighting: { bg: '#C03028', text: '#fff' },
    Poison: { bg: '#A040A0', text: '#fff' },
    Ground: { bg: '#E0C068', text: '#3d2d00' },
    Flying: { bg: '#A890F0', text: '#1a0a5c' },
    Psychic: { bg: '#F85888', text: '#4a001a' },
    Bug: { bg: '#A8B820', text: '#2d3300' },
    Rock: { bg: '#B8A038', text: '#2d2500' },
    Ghost: { bg: '#705898', text: '#fff' },
    Dragon: { bg: '#7038F8', text: '#fff' },
    Dark: { bg: '#705848', text: '#fff' },
    Steel: { bg: '#B8B8D0', text: '#1a1a2d' },
    Fairy: { bg: '#EE99AC', text: '#4a0020' },
};
const ALL_TYPES = Object.keys(TYPE_COLORS);

const TYPE_IDS = {
    Normal: 1, Fighting: 2, Flying: 3, Poison: 4, Ground: 5, Rock: 6,
    Bug: 7, Ghost: 8, Steel: 9, Fire: 10, Water: 11, Grass: 12,
    Electric: 13, Psychic: 14, Ice: 15, Dragon: 16, Dark: 17, Fairy: 18
};

// ============ TYPE CHART ============
const typeChart = {
    Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
    Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
    Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
    Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
    Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
    Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
    Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
    Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
    Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
    Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
    Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
    Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
    Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
    Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
    Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
    Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
    Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
    Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

function getEffectiveness(attackerTypes, defenderTypes) {
    const result = {};
    for (const atk of ALL_TYPES) {
        let mult = 1;
        for (const def of defenderTypes) {
            const row = typeChart[atk] || {};
            const m = row[def] !== undefined ? row[def] : 1;
            mult *= m;
        }
        result[atk] = mult;
    }
    return result;
}

// ============ POKEMON DATA ============
"""

js_content += f"const POKEMON = {json.dumps(pkm_data)};\n"

with open('js/data.js', 'w') as f:
    f.write(js_content)
