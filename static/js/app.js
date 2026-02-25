/* ============================================================
   ANTIGRAVITY RESEARCH LOG — app.js
   ============================================================ */

// ── STATE ────────────────────────────────────────────────────
const state = {
    siteData: { sections: [], all_tags: [], total_entries: 0, total_reading_time: 0, total_word_count: 0 },
    activeTag: null,
    currentView: 'dashboard', // 'dashboard' | 'section' | 'all' | 'search'
    currentSection: null,
    sortOrder: 'date-desc',   // 'date-desc' | 'date-asc' | 'title-asc'
    searchDebounce: null,
    openPosts: new Set(),
};

// Section lookup helper (derived from API data)
function getSectionCfg(id) {
    return state.siteData.sections.find(s => s.id === id) || null;
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await init();
    setupSearch();
    setupKeyboard();
    setupReadingProgress();
    window.addEventListener('hashchange', () => restoreFromHash(false));
});

async function init() {
    try {
        const res = await fetch('/api/content');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        state.siteData = await res.json();
        restoreFromHash(true);
    } catch (err) {
        console.error('Failed to load content:', err);
        document.getElementById('content-area').innerHTML = `
            <div class="empty-state">
                <span class="no-results-icon">⚠</span>
                <p>서버에 연결할 수 없습니다. Flask 서버가 실행 중인지 확인하세요.</p>
                <p style="margin-top:0.5rem;font-size:0.75rem;color:var(--text-muted);">${err.message}</p>
            </div>`;
    }
}

// ── READING PROGRESS ─────────────────────────────────────────
function setupReadingProgress() {
    const bar = document.getElementById('reading-progress');
    document.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total <= 0) {
            bar.classList.remove('visible');
            return;
        }
        const pct = Math.min(100, (scrolled / total) * 100);
        bar.style.setProperty('--reading-progress', pct + '%');
        bar.classList.toggle('visible', scrolled > 100);
    }, { passive: true });
}

// ── SEARCH ───────────────────────────────────────────────────
function setupSearch() {
    const input = document.getElementById('search-input');
    input.addEventListener('input', () => {
        clearTimeout(state.searchDebounce);
        const q = input.value.trim();
        if (!q) {
            renderDashboard();
            return;
        }
        state.searchDebounce = setTimeout(() => renderSearch(q), 280);
    });
}

async function renderSearch(q) {
    state.currentView = 'search';
    setActiveNav(null);
    const container = document.getElementById('content-area');

    // Optimistic local search first (fast), then server confirms
    const results = localSearch(q);
    renderSearchResults(q, results, container);
}

function localSearch(q) {
    const lower = q.toLowerCase();
    const results = [];
    for (const section of state.siteData.sections) {
        for (const item of section.items) {
            const haystack = (item.title + ' ' + strip(item.content) + ' ' + (item.tags || []).join(' ')).toLowerCase();
            if (haystack.includes(lower)) {
                results.push({ ...item, _section: section.id });
            }
        }
    }
    return results;
}

function strip(html) {
    return html.replace(/<[^>]+>/g, ' ');
}

function highlight(text, q) {
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark style="background:rgba(203,166,247,0.25);color:inherit;border-radius:2px;padding:0 2px;">$1</mark>');
}

function renderSearchResults(q, results, container) {
    const count = results.length;
    const header = `
        <div class="search-results-header">
            <h2>
                <strong>${count}</strong> result${count !== 1 ? 's' : ''} for
                "<span style="color:var(--accent-mauve)">${escHtml(q)}</span>"
            </h2>
        </div>`;

    if (count === 0) {
        container.innerHTML = header + `
            <div class="no-results">
                <span class="no-results-icon">⌕</span>
                <p>No entries found.</p>
            </div>`;
        return;
    }

    const cardsHtml = results.map((item, i) => buildPostCard(item, i, q)).join('');
    container.innerHTML = header + `<div class="posts-list">${cardsHtml}</div>`;
    restoreOpenPosts();
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────
function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
        const input = document.getElementById('search-input');
        // / → focus search
        if (e.key === '/' && document.activeElement !== input) {
            e.preventDefault();
            input.focus();
            input.select();
        }
        // Escape → clear search / go dashboard
        if (e.key === 'Escape') {
            if (document.activeElement === input) {
                input.blur();
            }
            if (input.value) {
                input.value = '';
                renderDashboard();
            }
        }
    });
}

// ── TAG FILTER ────────────────────────────────────────────────
function renderTagBar(contextItems = null) {
    const bar = document.getElementById('tag-filter-bar');
    const tags = contextItems
        ? [...new Set(contextItems.flatMap(i => i.tags || []))]
        : state.siteData.all_tags || [];

    if (!tags.length) { bar.hidden = true; return; }
    bar.hidden = false;

    const chips = tags.map(tag => {
        const active = state.activeTag === tag;
        return `<button class="tag-chip ${active ? 'active' : ''}" onclick="filterByTag('${escHtml(tag)}')">${escHtml(tag)}</button>`;
    }).join('');

    const clearBtn = state.activeTag
        ? `<button class="tag-chip tag-chip-clear" onclick="filterByTag(null)">✕ Clear</button>`
        : '';

    bar.innerHTML = `<span class="tag-filter-label">Filter</span>${clearBtn}${chips}`;
}

function filterByTag(tag) {
    state.activeTag = (state.activeTag === tag) ? null : tag;
    if (state.currentView === 'all') {
        loadAllEntries();
    } else if (state.currentView === 'section' && state.currentSection) {
        applyTagFilter();
        const sectionData = state.siteData.sections.find(s => s.id === state.currentSection);
        renderTagBar(sectionData ? sectionData.items : null);
    } else {
        renderDashboard();
    }
}

function applyTagFilter() {
    if (!state.activeTag) {
        document.querySelectorAll('.post-card').forEach(c => c.style.display = '');
        return;
    }
    document.querySelectorAll('.post-card').forEach(card => {
        const tags = card.dataset.tags ? card.dataset.tags.split(',') : [];
        card.style.display = tags.includes(state.activeTag) ? '' : 'none';
    });
}

// ── DASHBOARD ─────────────────────────────────────────────────
function renderDashboard() {
    state.currentView = 'dashboard';
    state.currentSection = null;
    state.activeTag = null;
    setActiveNav('nav-dashboard');
    document.getElementById('tag-filter-bar').hidden = true;
    document.getElementById('search-input').value = '';
    updateHash('dashboard');

    const container = document.getElementById('content-area');
    const { sections, total_entries, total_reading_time } = state.siteData;
    const h = new Date().getHours();
    const greeting = h < 6 ? '늦은 밤에도' : h < 12 ? '좋은 아침' : h < 18 ? '좋은 오후' : '좋은 저녁';

    const cardsHtml = sections.map(sec => {
        const count = sec.items.length;
        const latest = count ? sec.items[0] : null;
        return `
            <div class="dashboard-card" style="--card-accent:${sec.color}" onclick="loadSection('${sec.id}')" tabindex="0"
                 role="button" aria-label="Open ${sec.title} — ${count} entries"
                 onkeydown="if(event.key==='Enter')loadSection('${sec.id}')">
                <div class="card-count" aria-hidden="true">${String(count).padStart(2, '0')}</div>
                <h2>${sec.title}</h2>
                <p class="card-desc">${sec.desc}</p>
                ${latest ? `<div class="card-latest">Latest: ${escHtml(latest.title)}</div>` : ''}
                <span class="card-arrow" aria-hidden="true">↗</span>
            </div>`;
    }).join('');

    // Recent entries (latest 5 across all sections)
    const allItems = sections.flatMap(s => s.items.map(i => ({ ...i, _section: s.id })));
    allItems.sort((a, b) => b.date.localeCompare(a.date));
    const recent = allItems.slice(0, 5);

    const recentHtml = recent.map(item => {
        const sec = getSectionCfg(item._section);
        const uid = `post-${item._section}-${item.slug}-0`;
        return `
            <div class="recent-item" onclick="loadSectionAndOpen('${item._section}','${escHtml(item.slug)}')" tabindex="0"
                 role="button" onkeydown="if(event.key==='Enter')loadSectionAndOpen('${item._section}','${escHtml(item.slug)}')">
                <span class="recent-item-date">${item.formatted_date || item.date}</span>
                <span class="recent-item-title">${escHtml(item.title)}</span>
                <span class="recent-item-cat" style="color:${sec?.color}">${sec?.title || item._section}</span>
            </div>`;
    }).join('');

    const totalMins = total_reading_time || 0;
    const totalHours = Math.floor(totalMins / 60);
    const readLabel = totalHours > 0 ? `${totalHours}h ${totalMins % 60}m` : `${totalMins}m`;

    container.innerHTML = `
        <div class="dashboard-hero">
            <h1>${greeting}, <em>researcher</em>.</h1>
            <p>리서치 아카이브 현황입니다.</p>
            <div class="dashboard-meta">
                <span>${total_entries} entries</span>
                <span class="meta-sep-dot">·</span>
                <span>${(state.siteData.all_tags || []).length} tags</span>
                <span class="meta-sep-dot">·</span>
                <span>총 읽기 ${readLabel}</span>
            </div>
        </div>
        <div class="dashboard-grid">${cardsHtml}</div>
        ${recent.length ? `
        <div class="recent-strip">
            <h3>Recent Entries</h3>
            <div class="recent-list">${recentHtml}</div>
        </div>` : ''}
    `;
}

// ── SECTION VIEW ──────────────────────────────────────────────
function loadSection(sectionId, autoOpenSlug = null) {
    state.currentView = 'section';
    state.currentSection = sectionId;
    state.activeTag = null;
    setActiveNav(null);
    updateHash('section', sectionId);

    const container = document.getElementById('content-area');
    const sec = getSectionCfg(sectionId);
    const data = state.siteData.sections.find(s => s.id === sectionId);
    if (!data || !sec) return;

    renderTagBar(data.items);

    const sorted = sortItems(data.items);
    const itemsHtml = sorted.length === 0
        ? `<div class="empty-state"><p>No entries yet in this section.</p></div>`
        : sorted.map((item, i) => buildPostCard(item, i)).join('');

    container.innerHTML = `
        <button class="back-btn" onclick="renderDashboard()">
            <span class="back-arrow" aria-hidden="true">←</span> Back to Dashboard
        </button>
        <div class="section-header" style="--section-color:${sec.color}">
            <h2>${sec.title}</h2>
            <div style="display:flex;align-items:center;gap:var(--space-4)">
                <span class="section-count">${data.items.length} ${data.items.length === 1 ? 'entry' : 'entries'}</span>
                ${buildSortControl()}
            </div>
        </div>
        <div class="posts-list">${itemsHtml}</div>
    `;
    restoreOpenPosts();

    // F4: auto-open a specific post if requested
    if (autoOpenSlug) {
        requestAnimationFrame(() => {
            const card = document.querySelector(`[data-slug="${autoOpenSlug}"]`);
            if (card) {
                const uid = card.id;
                if (uid) { togglePost(uid); scrollToWithOffset(card); }
            }
        });
    }
}

// F4: Open a section and immediately expand a specific entry
function loadSectionAndOpen(sectionId, slug) {
    loadSection(sectionId, slug);
}

// ── ALL ENTRIES ───────────────────────────────────────────────
function loadAllEntries() {
    state.currentView = 'all';
    state.currentSection = null;
    setActiveNav('nav-all');
    updateHash('all');

    const container = document.getElementById('content-area');
    const allItems = state.siteData.sections.flatMap(s =>
        s.items.map(i => ({ ...i, _section: s.id }))
    );
    const sorted = sortItems(allItems);

    renderTagBar(allItems);

    const cardsHtml = sorted.map((item, i) => buildPostCard(item, i)).join('');

    container.innerHTML = `
        <button class="back-btn" onclick="renderDashboard()">
            <span class="back-arrow" aria-hidden="true">←</span> Back to Dashboard
        </button>
        <div class="section-header">
            <h2 style="font-family:var(--font-display);font-size:clamp(2rem,4vw,3rem)">All Entries</h2>
            <div style="display:flex;align-items:center;gap:var(--space-4)">
                <span class="section-count">${allItems.length} entries</span>
                ${buildSortControl()}
            </div>
        </div>
        <div class="posts-list">${cardsHtml}</div>
    `;
    restoreOpenPosts();
}

// ── SORT ──────────────────────────────────────────────────────
function sortItems(items) {
    const arr = [...items];
    if (state.sortOrder === 'date-asc') {
        arr.sort((a, b) => a.date.localeCompare(b.date));
    } else if (state.sortOrder === 'title-asc') {
        arr.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    } else {
        arr.sort((a, b) => b.date.localeCompare(a.date)); // date-desc default
    }
    return arr;
}

function buildSortControl() {
    const opts = [
        { val: 'date-desc', label: '최신순' },
        { val: 'date-asc', label: '오래된순' },
        { val: 'title-asc', label: '제목순' },
    ];
    const options = opts.map(o =>
        `<option value="${o.val}" ${state.sortOrder === o.val ? 'selected' : ''}>${o.label}</option>`
    ).join('');
    return `<select class="sort-select" onchange="applySort(this.value)" aria-label="정렬 기준">${options}</select>`;
}

function applySort(order) {
    state.sortOrder = order;
    if (state.currentView === 'section' && state.currentSection) loadSection(state.currentSection);
    else if (state.currentView === 'all') loadAllEntries();
}

// ── POST CARD BUILDER ─────────────────────────────────────────
function buildPostCard(item, index, searchQuery = '') {
    const uid = `post-${item._section || item.category}-${item.slug}-${index}`;
    const tags = (item.tags || []);
    const tagHtml = tags
        .map(t => `<span class="tag" onclick="event.stopPropagation();filterByTag('${escHtml(t)}')">${escHtml(t)}</span>`)
        .join('');

    const titleHtml = searchQuery
        ? highlight(escHtml(item.title), searchQuery)
        : escHtml(item.title);

    const sec = getSectionCfg(item._section || item.category);

    return `
        <article class="post-card" id="${uid}" data-tags="${tags.map(escHtml).join(',')}" data-uid="${uid}" data-slug="${escHtml(item.slug)}">
            <div class="post-card-header" onclick="togglePost('${uid}')">
                <h3>${titleHtml}</h3>
                <div class="post-meta">
                    ${item.formatted_date ? `<span class="meta-date">${item.formatted_date}</span>` : ''}
                    ${item.formatted_date && item.reading_time ? `<span class="meta-sep" aria-hidden="true">·</span>` : ''}
                    ${item.reading_time ? `<span class="meta-reading">${item.reading_time} min read</span>` : ''}
                    ${sec ? `<span class="meta-sep" aria-hidden="true">·</span><span class="tag" style="cursor:default;pointer-events:none;color:${sec.color};border-color:${sec.color}20;background:${sec.color}10">${sec.title}</span>` : ''}
                    ${tagHtml ? `<span class="meta-sep" aria-hidden="true">·</span><span class="meta-tags">${tagHtml}</span>` : ''}
                </div>
            </div>
            <div class="post-summary">
                ${item.summary}
            </div>
            <div class="post-actions">
                <button class="btn-read-more" id="btn-${uid}" onclick="togglePost('${uid}')">
                    <span class="btn-icon" aria-hidden="true">▾</span> Read Entry
                </button>
            </div>
            <div class="post-full-wrapper" id="wrapper-${uid}">
                <div class="post-full-content prose" id="full-${uid}">
                    ${item.content}
                    <div style="margin-top:2rem;padding-top:1rem;border-top:1px solid var(--border)">
                        <button class="btn-read-more open" onclick="togglePost('${uid}')">
                            <span class="btn-icon" aria-hidden="true">▴</span> Close
                        </button>
                    </div>
                </div>
            </div>
        </article>`;
}

// ── POST TOGGLE ───────────────────────────────────────────────
function togglePost(uid) {
    const wrapper = document.getElementById(`wrapper-${uid}`);
    const btn = document.getElementById(`btn-${uid}`);
    if (!wrapper || !btn) return;

    const isOpen = wrapper.classList.contains('open');
    if (isOpen) {
        wrapper.classList.remove('open');
        btn.classList.remove('open');
        btn.innerHTML = `<span class="btn-icon" aria-hidden="true">▾</span> Read Entry`;
        state.openPosts.delete(uid);
    } else {
        wrapper.classList.add('open');
        btn.classList.add('open');
        btn.innerHTML = `<span class="btn-icon" aria-hidden="true">▴</span> Close`;
        state.openPosts.add(uid);
        // D3: scroll after animation, account for sticky header height
        setTimeout(() => {
            const card = document.getElementById(uid);
            if (card) scrollToWithOffset(card);
        }, 360);
    }
}

// D3: scroll with sticky header offset
function scrollToWithOffset(el) {
    const header = document.getElementById('site-header');
    const offset = header ? header.getBoundingClientRect().height + 16 : 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
}

function restoreOpenPosts() {
    for (const uid of state.openPosts) {
        const wrapper = document.getElementById(`wrapper-${uid}`);
        const btn = document.getElementById(`btn-${uid}`);
        if (wrapper && btn) {
            wrapper.classList.add('open');
            btn.classList.add('open');
            btn.innerHTML = `<span class="btn-icon" aria-hidden="true">▴</span> Close`;
        }
    }
}

// ── NAV HELPERS ───────────────────────────────────────────────
function setActiveNav(id) {
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    if (id) document.getElementById(id)?.classList.add('active');
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg, duration = 2500) {
    const region = document.getElementById('toast-region');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    region.appendChild(el);
    setTimeout(() => {
        el.classList.add('out');
        el.addEventListener('animationend', () => el.remove());
    }, duration);
}

// ── UTILS ─────────────────────────────────────────────────────
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ── HASH ROUTING ──────────────────────────────────────────────
function updateHash(view, id = '') {
    const hash = id ? `${view}/${id}` : view;
    history.replaceState(null, '', `#${hash}`);
}

function restoreFromHash(isInit = false) {
    const hash = location.hash.slice(1);
    const validIds = state.siteData.sections.map(s => s.id);
    if (!hash || hash === 'dashboard') {
        renderDashboard();
    } else if (hash === 'all') {
        loadAllEntries();
    } else if (hash.startsWith('section/')) {
        const id = hash.replace('section/', '');
        if (validIds.includes(id)) loadSection(id);
        else renderDashboard();
    } else {
        renderDashboard();
    }
}
