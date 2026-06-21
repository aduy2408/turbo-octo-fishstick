import requests
import json

query = """
query {
  pokemon_v2_pokemon(limit: 1025) {
    id
    name
    pokemon_v2_pokemontypes {
      pokemon_v2_type {
        name
      }
    }
  }
}
"""

url = 'https://beta.pokeapi.co/graphql/v1beta'
response = requests.post(url, json={'query': query})
data = response.json()

formatted = []
for p in data['data']['pokemon_v2_pokemon']:
    types = [t['pokemon_v2_type']['name'].capitalize() for t in p['pokemon_v2_pokemontypes']]
    formatted.append({
        'id': p['id'],
        'name': p['name'].capitalize(),
        'types': types
    })

with open('pokemon_data.json', 'w') as f:
    json.dump(formatted, f)

print(f"Downloaded {len(formatted)} pokemon")
