import re

path = 'src/data/products.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

var_map = {
    'red-maroon': 'red-maroon.webp',
    'black-orange': 'black-orange.webp',
    'white-red': 'white-red.webp',
    'royal-blue-red': 'royal-blue-red.webp',
    'pink-purple': 'pink-purple.webp',
    'royal-blue-white': 'royal-blue-white.webp',
    'pink-white': 'pink-white.webp',
    'white-pink': 'white-pink.webp',
    'white-blue': 'white-blue.webp',
    'cream-purple': 'cream-purple.webp',
    'yellow-purple': 'yellow-purple.webp',
}

prod_map = {
    1: 'red-maroon.webp',
    2: 'black-orange.webp',
    3: 'white-red.webp',
    4: 'royal-blue-red.webp',
    5: 'pink-purple.webp',
    6: 'royal-blue-white.webp',
    7: 'pink-white.webp',
    8: 'white-pink.webp',
    9: 'white-blue.webp',
    10: 'cream-purple.webp',
    11: 'yellow-purple.webp',
}

new_lines = []
curr_prod_id = None
for line in lines:
    for vid, img in var_map.items():
        if f"id: '{vid}'" in line and "image: '/images/products/.webp'" in line:
            line = line.replace("image: '/images/products/.webp'", f"image: '/images/products/{img}'")

    m = re.search(r'id:\s*(\d+)', line)
    if m:
        curr_prod_id = int(m.group(1))

    if curr_prod_id in prod_map and "image: '/images/products/.webp'" in line:
        img = prod_map[curr_prod_id]
        line = line.replace("image: '/images/products/.webp'", f"image: '/images/products/{img}'")

    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Updated src/data/products.js!')
