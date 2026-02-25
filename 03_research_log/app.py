from flask import Flask, render_template, jsonify
import os
import re
import markdown
import frontmatter
from datetime import datetime

app = Flask(__name__, template_folder='templates', static_folder='static')

CONTENT_DIR = os.path.join(os.path.dirname(__file__), 'content')

# ── SECTIONS (single source of truth) ─────────────────────────────
SECTIONS_MAP = [
    {'id': 'projects',  'title': 'Projects',  'color': '#cba6f7', 'desc': 'Ongoing development and shipped experiments.'},
    {'id': 'research',  'title': 'Research',  'color': '#89b4fa', 'desc': 'Deep dives, technical analyses, and findings.'},
    {'id': 'study',     'title': 'Study Logs', 'color': '#a6e3a1', 'desc': 'Daily learnings, notes, and breakdowns.'},
    {'id': 'ideas',     'title': 'Ideas',     'color': '#f9e2af', 'desc': 'Sparks, hypotheses, and future concepts.'},
    {'id': 'notes',     'title': 'Notes',     'color': '#89dceb', 'desc': 'Quick notes and references.'},
    {'id': 'bookmarks', 'title': 'Bookmarks', 'color': '#fab387', 'desc': 'Saved links and resources.'},
]

# ── CACHE ────────────────────────────────────────────────────
# { filepath: { 'mtime': float, 'data': dict } }
_file_cache = {}
# { category: { 'mtimes': {filepath: mtime}, 'items': list } }
_section_cache = {}


def slug_from_filename(filename):
    return filename.replace('.md', '')


def _render_wikilinks(text):
    """Convert [[Title]] to <span class="wikilink">Title</span>."""
    return re.sub(r'\[\[([^\]]+)\]\]', r'<span class="wikilink">\1</span>', text)


def _parse_file(filepath, category):
    """Parse a single .md file and return a data dict."""
    filename = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        post = frontmatter.load(f)

    html_content = markdown.markdown(
        post.content,
        extensions=['fenced_code', 'tables', 'toc', 'codehilite']
    )
    html_content = _render_wikilinks(html_content)

    summary = ""
    if "<!-- more -->" in post.content:
        summary_md = post.content.split("<!-- more -->")[0]
        summary = markdown.markdown(summary_md, extensions=['fenced_code'])
    else:
        plain = re.sub(r'<[^>]+>', '', html_content)
        summary_text = plain[:300].strip()
        summary = f"<p>{summary_text}{'...' if len(plain) > 300 else ''}</p>"

    word_count = len(post.content.split())
    # Korean-aware reading time: ~500 chars/min for Korean, 200 wpm for English
    korean_chars = sum(1 for c in post.content if '\uAC00' <= c <= '\uD7A3')
    if korean_chars > 30:
        char_count = len(re.sub(r'\s', '', post.content))
        reading_time = max(1, round(char_count / 500))
    else:
        reading_time = max(1, round(word_count / 200))

    raw_date = post.get('date', '')
    formatted_date = ''
    if raw_date:
        try:
            dt = datetime.strptime(str(raw_date), '%Y-%m-%d')
            formatted_date = dt.strftime('%b %d, %Y')
        except Exception:
            formatted_date = str(raw_date)

    tags = post.get('tags', [])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(',')]

    return {
        'title': post.get('title', 'Untitled'),
        'date': str(raw_date),
        'formatted_date': formatted_date,
        'tags': tags,
        'content': html_content,
        'summary': summary,
        'filename': filename,
        'slug': slug_from_filename(filename),
        'reading_time': reading_time,
        'word_count': word_count,
        'category': category,
    }


def get_content_files(category):
    category_path = os.path.join(CONTENT_DIR, category)
    if not os.path.exists(category_path):
        return []

    # Collect current mtime snapshot
    current_mtimes = {}
    for filename in os.listdir(category_path):
        if not filename.endswith('.md'):
            continue
        fp = os.path.join(category_path, filename)
        current_mtimes[fp] = os.path.getmtime(fp)

    cached = _section_cache.get(category)
    if cached and cached['mtimes'] == current_mtimes:
        return cached['items']

    # Full rebuild: reuse per-file cache where mtime unchanged
    files = []
    for fp, mtime in current_mtimes.items():
        if fp in _file_cache and _file_cache[fp]['mtime'] == mtime:
            data = _file_cache[fp]['data']
        else:
            data = _parse_file(fp, category)
            _file_cache[fp] = {'mtime': mtime, 'data': data}
        files.append(data)

    files.sort(key=lambda x: x['date'], reverse=True)
    _section_cache[category] = {'mtimes': current_mtimes, 'items': files}
    return files


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/content')
def get_all_content():
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

    return jsonify({
        'sections': sections,
        'all_tags': all_tags,
        'total_entries': len(all_items),
        'total_reading_time': total_reading_time,
        'total_word_count': total_word_count,
    })



if __name__ == '__main__':
    app.run(debug=True, port=5500)
