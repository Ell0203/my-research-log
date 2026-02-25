import os
import shutil
import json
from app import app, get_all_content, get_content_files, SECTIONS_MAP

def build():
    print("Building static site for Research Log...")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(base_dir, 'dist')
    
    # 1. Clean and create dist directory
    if os.path.exists(dist_dir):
        shutil.rmtree(dist_dir)
    os.makedirs(dist_dir)
    
    # 2. Copy static files
    print("Copying static files...")
    shutil.copytree(os.path.join(base_dir, 'static'), os.path.join(dist_dir, 'static'))
    
    # 3. Copy index.html
    print("Copying index.html...")
    shutil.copy(os.path.join(base_dir, 'templates', 'index.html'), os.path.join(dist_dir, 'index.html'))
    
    # 4. Generate API content JSON
    print("Generating API content JSON...")
    os.makedirs(os.path.join(dist_dir, 'api'), exist_ok=True)
    
    with app.app_context():
        # Get data directly from the same logic used by the Flask route
        all_items = []
        sections = []
        total_word_count = 0
        for section in SECTIONS_MAP:
            items = get_content_files(section['id'])
            all_items.extend(items)
            total_word_count += sum(i['word_count'] for i in items)
            sections.append({
                'id': section['id'],
                'title': section['title'],
                'color': section['color'],
                'desc': section['desc'],
                'items': items,
            })

        all_tags = sorted(set(tag for item in all_items for tag in item['tags'] if tag))
        total_reading_time = sum(i['reading_time'] for i in all_items)

        data = {
            'sections': sections,
            'all_tags': all_tags,
            'total_entries': len(all_items),
            'total_reading_time': total_reading_time,
            'total_word_count': total_word_count,
        }
        
        with open(os.path.join(dist_dir, 'api', 'content.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    # 5. Modify app.js in dist to fetch the static JSON file
    print("Patching app.js for static fetching...")
    app_js_path = os.path.join(dist_dir, 'static', 'js', 'app.js')
    with open(app_js_path, 'r', encoding='utf-8') as f:
        js_content = f.read()

    js_content = js_content.replace("fetch('/api/content')", "fetch('/api/content.json')")
    
    with open(app_js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print("Build complete! The site is now sitting in the 'dist' folder.")
    print("You can drag and drop the 'dist' folder into Netlify/Vercel.")

if __name__ == "__main__":
    build()
