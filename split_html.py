import re

with open('pkm.html', 'r') as f:
    content = f.read()

# Extract CSS
css_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if css_match:
    with open('css/style.css', 'w') as f:
        f.write(css_match.group(1).strip())

# Extract JS
js_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
if js_match:
    with open('js/quiz.js', 'w') as f:
        f.write(js_match.group(1).strip())

# Extract HTML Body
html_match = re.search(r'<body>(.*?)<script>', content, re.DOTALL)
if html_match:
    body_content = html_match.group(1).strip()
    
    # We will build a new index.html with tabs
    index_html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pokémon Hub</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <div class="logo">Pokémon <span>Hub</span></div>
        <div class="tabs" style="display:flex; gap:1rem; margin-left:2rem;">
            <button class="tab-btn active" data-tab="quiz">Type Quiz</button>
            <button class="tab-btn" data-tab="versus">Versus Mode</button>
        </div>
        <div class="score-bar" id="score-bar">
            <div class="score-item"><div class="val" id="s-correct" style="color:var(--correct)">0</div><div class="lbl">Đúng</div></div>
            <div class="score-item"><div class="val" id="s-wrong" style="color:var(--wrong)">0</div><div class="lbl">Sai</div></div>
            <div class="score-item"><div class="val" id="s-streak" style="color:#f5a623">0</div><div class="lbl">Streak</div></div>
            <div class="score-item"><div class="val" id="s-acc">—</div><div class="lbl">Accuracy</div></div>
        </div>
    </header>

    <div id="tab-quiz" class="tab-content" style="display:block;">
        {body_content.replace('<header>', '').replace('</header>', '').replace('<div class="logo">Pokémon <span>Type</span> Quiz</div>', '').replace('<div class="score-bar">', '<!-- score-bar moved -->').split('</header>')[0]}
    </div>

    <div id="tab-versus" class="tab-content" style="display:none; width: 100%; max-width: 900px; padding: 1.5rem 1rem 4rem; margin: 0 auto;">
        <!-- Versus mode will be rendered here -->
    </div>

    <script src="js/data.js"></script>
    <script src="js/quiz.js"></script>
    <script src="js/versus.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
"""
    with open('index.html', 'w') as f:
        f.write(index_html)
