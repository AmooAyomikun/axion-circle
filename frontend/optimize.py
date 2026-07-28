import os
import re

SRC_DIR = r"c:\Users\user\Documents\Internships\Circle Orange Internship\axion-circle\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    filename = os.path.basename(filepath)

    # 1. Add loading="lazy" to <img>
    img_tags = re.findall(r'<img[^>]+>', content)
    for img in img_tags:
        if 'loading=' not in img and 'fetchpriority=' not in img:
            new_img = img.replace('<img ', '<img loading="lazy" ')
            content = content.replace(img, new_img)
            
    # 2. Add rel="noopener noreferrer" to target="_blank"
    a_tags = re.findall(r'<a [^>]*target="_blank"[^>]*>', content) + re.findall(r'<Link [^>]*target="_blank"[^>]*>', content)
    for a in a_tags:
        if 'rel="noopener noreferrer"' not in a:
            new_a = a.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"')
            content = content.replace(a, new_a)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")

for root, _, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Done optimization script")
