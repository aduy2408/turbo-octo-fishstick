import os
import requests
import json
from concurrent.futures import ThreadPoolExecutor

os.makedirs('assets/pokemon', exist_ok=True)
os.makedirs('assets/types', exist_ok=True)

# 1. Download type icons
types = list(range(1, 19))
def download_type(tid):
    url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/{tid}.png"
    dest = f"assets/types/{tid}.png"
    if not os.path.exists(dest):
        try:
            r = requests.get(url, timeout=10)
            if r.status_code == 200:
                with open(dest, 'wb') as f:
                    f.write(r.content)
        except Exception as e:
            print(f"Error type {tid}: {e}")

# 2. Download pokemon sprites
with open('pokemon_data.json', 'r') as f:
    pkm_data = json.load(f)

def download_pokemon(pkm):
    pid = pkm['id']
    url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{pid}.png"
    dest = f"assets/pokemon/{pid}.png"
    if not os.path.exists(dest):
        try:
            r = requests.get(url, timeout=10)
            if r.status_code == 200:
                with open(dest, 'wb') as f:
                    f.write(r.content)
            else:
                # Fallback to normal sprite if official artwork doesn't exist
                url_fb = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pid}.png"
                r_fb = requests.get(url_fb, timeout=10)
                if r_fb.status_code == 200:
                    with open(dest, 'wb') as f:
                        f.write(r_fb.content)
        except Exception as e:
            print(f"Error pokemon {pid}: {e}")

print("Downloading type icons...")
with ThreadPoolExecutor(max_workers=10) as executor:
    executor.map(download_type, types)

print("Downloading pokemon sprites... (this will take a minute)")
with ThreadPoolExecutor(max_workers=20) as executor:
    executor.map(download_pokemon, pkm_data)

print("Download complete!")
