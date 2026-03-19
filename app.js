/* ============================================================
   AI Cost Calculator — app.js
   Vanilla JS: State, calculation engine, DOM, interactions
   ============================================================ */

// ─── Model Pricing Database ───
const MODEL_DB = [
    // OpenAI
    { provider: 'OpenAI', model: 'GPT-5.4',        input: 2.50,  output: 15.00  },
    { provider: 'OpenAI', model: 'GPT-5.4 Mini',   input: 0.75,  output: 4.50   },
    { provider: 'OpenAI', model: 'GPT-5.4 Nano',   input: 0.20,  output: 1.25   },
    { provider: 'OpenAI', model: 'GPT-5.2 Pro',    input: 21.00, output: 168.00 },
    { provider: 'OpenAI', model: 'GPT-5.2',        input: 1.75,  output: 14.00  },
    { provider: 'OpenAI', model: 'GPT-5',          input: 1.25,  output: 10.00  },
    { provider: 'OpenAI', model: 'GPT-5 Mini',     input: 0.25,  output: 2.00   },
    { provider: 'OpenAI', model: 'GPT-5 Nano',     input: 0.05,  output: 0.40   },
    { provider: 'OpenAI', model: 'o3',             input: 2.00,  output: 8.00   },
    { provider: 'OpenAI', model: 'o4-mini',        input: 1.10,  output: 4.40   },
    { provider: 'OpenAI', model: 'GPT-4.1',        input: 2.00,  output: 8.00   },
    { provider: 'OpenAI', model: 'GPT-4.1 Mini',   input: 0.40,  output: 1.60   },
    { provider: 'OpenAI', model: 'GPT-4.1 Nano',   input: 0.10,  output: 0.40   },
    { provider: 'OpenAI', model: 'GPT-4o',         input: 2.50,  output: 10.00  },
    { provider: 'OpenAI', model: 'GPT-4o-mini',    input: 0.15,  output: 0.60   },

    // Anthropic
    { provider: 'Anthropic', model: 'Claude Opus 4.6',     input: 5.00,  output: 25.00 },
    { provider: 'Anthropic', model: 'Claude Sonnet 4.6',   input: 3.00,  output: 15.00 },
    { provider: 'Anthropic', model: 'Claude Opus 4.5',     input: 5.00,  output: 25.00 },
    { provider: 'Anthropic', model: 'Claude Sonnet 4.5',   input: 3.00,  output: 15.00 },
    { provider: 'Anthropic', model: 'Claude Haiku 4.5',    input: 1.00,  output: 5.00  },
    { provider: 'Anthropic', model: 'Claude Opus 4.1/4',   input: 15.00, output: 75.00 },
    { provider: 'Anthropic', model: 'Claude Sonnet 4',     input: 3.00,  output: 15.00 },

    // Google
    { provider: 'Google', model: 'Gemini 3.1 Pro (\u2264200K)',      input: 2.00,  output: 12.00 },
    { provider: 'Google', model: 'Gemini 3.1 Pro (>200K)',           input: 4.00,  output: 18.00 },
    { provider: 'Google', model: 'Gemini 3 Pro (\u2264200K)',        input: 2.00,  output: 12.00 },
    { provider: 'Google', model: 'Gemini 3 Pro (>200K)',             input: 4.00,  output: 18.00 },
    { provider: 'Google', model: 'Gemini 3.1 Flash-Lite',            input: 0.25,  output: 1.50  },
    { provider: 'Google', model: 'Gemini 3 Flash',                   input: 0.50,  output: 3.00  },
    { provider: 'Google', model: 'Gemini 2.5 Pro (\u2264200K)',      input: 1.25,  output: 10.00 },
    { provider: 'Google', model: 'Gemini 2.5 Pro (>200K)',           input: 2.50,  output: 15.00 },
    { provider: 'Google', model: 'Gemini 2.5 Flash',                 input: 0.30,  output: 2.50  },
    { provider: 'Google', model: 'Gemini 2.5 Flash-Lite',            input: 0.10,  output: 0.40  },
    { provider: 'Google', model: 'Gemini 2.0 Flash',                 input: 0.10,  output: 0.40  },
    { provider: 'Google', model: 'Gemini 2.0 Flash-Lite',            input: 0.075, output: 0.30  },

    // Mistral
    { provider: 'Mistral', model: 'Mistral Large 2',    input: 2.00, output: 6.00 },
    { provider: 'Mistral', model: 'Magistral Medium',   input: 2.00, output: 5.00 },
    { provider: 'Mistral', model: 'Codestral',          input: 1.00, output: 3.00 },
    { provider: 'Mistral', model: 'Pixtral Large',      input: 2.00, output: 6.00 },
    { provider: 'Mistral', model: 'Magistral Small',    input: 0.50, output: 1.50 },
    { provider: 'Mistral', model: 'Mistral Small',      input: 0.20, output: 0.60 },
    { provider: 'Mistral', model: 'Mistral NeMo',       input: 0.15, output: 0.15 },

    // xAI
    { provider: 'xAI', model: 'Grok 4',           input: 3.00, output: 15.00 },
    { provider: 'xAI', model: 'Grok 4 Fast',      input: 0.20, output: 0.50  },
    { provider: 'xAI', model: 'Grok 4.1 Fast',    input: 0.20, output: 0.50  },
    { provider: 'xAI', model: 'Grok Code Fast 1', input: 0.20, output: 1.50  },
];

const PINNED_MODEL = 'Gemini 3.1 Flash-Lite';

// ─── Application State ───
const state = {
    selectedModels: [],
    users: 1000,
    activePct: 25,
    requestsPerDay: 6,
    inputTokens: 500,
    outputTokens: 300,
};

// ─── DOM Helpers ───
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── DOM References (set after DOMContentLoaded) ───
let dom = {};
let chartInstance = null;

// ─── Calculation Engine ───
function calculate(model) {
    const dau = state.users * (state.activePct / 100);
    const totalReqs = dau * state.requestsPerDay;
    const totalIn = totalReqs * state.inputTokens;
    const totalOut = totalReqs * state.outputTokens;
    const dailyCost = (totalIn / 1e6) * model.input + (totalOut / 1e6) * model.output;
    return {
        dau,
        totalReqs,
        dailyCost,
        monthlyCost: dailyCost * 30,
        annualCost: dailyCost * 365,
        costPerUser: state.users > 0 ? (dailyCost * 30) / state.users : 0,
        inputCostDaily: (totalIn / 1e6) * model.input,
        outputCostDaily: (totalOut / 1e6) * model.output,
    };
}

// ─── Formatting ───
function fmt(v) {
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e4) return '$' + (v / 1e3).toFixed(1) + 'K';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(2) + 'K';
    if (v < 0.01 && v > 0) return '$' + v.toFixed(4);
    return '$' + v.toFixed(2);
}
function fmtNum(v) { return v.toLocaleString('en-US'); }

// ─── Render Results ───
function renderAll() {
    if (state.selectedModels.length === 0) {
        dom.resultsBody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--washi-dim);font-family:var(--font-body);">Select models to see cost estimates</td></tr>';
        renderSummary(null);
        renderChart(null);
        return;
    }

    const results = state.selectedModels.map(m => ({ ...m, ...calculate(m) }));

    // Table
    dom.resultsBody.innerHTML = results.map(r => {
        const pinCls = r.model === PINNED_MODEL && !r.custom ? ' table-row-pinned' : '';
        return `<tr class="${pinCls}">
            <td>${esc(r.model)}</td>
            <td>${esc(r.provider)}${r.custom ? ' <span style="opacity:.45">(Custom)</span>' : ''}</td>
            <td>$${r.input}</td>
            <td>$${r.output}</td>
            <td>${fmt(r.dailyCost)}</td>
            <td>${fmt(r.monthlyCost)}</td>
            <td>${fmt(r.annualCost)}</td>
            <td>${fmt(r.costPerUser)}</td>
        </tr>`;
    }).join('');

    // Summary
    const totals = results.reduce((a, r) => {
        a.daily += r.dailyCost; a.monthly += r.monthlyCost; a.annual += r.annualCost;
        return a;
    }, { daily: 0, monthly: 0, annual: 0 });
    renderSummary(totals, results[0]);
    renderChart(results);
}

function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function renderSummary(totals, first) {
    if (!totals) {
        $('#val-daily').textContent = '$0.00';
        $('#val-monthly').textContent = '$0.00';
        $('#val-annual').textContent = '$0.00';
        $('#val-per-user').textContent = '$0.00';
        $('#sub-daily').textContent = '0 requests';
        $('#sub-per-user').textContent = 'per active user';
        return;
    }
    $('#val-daily').textContent = fmt(totals.daily);
    $('#val-monthly').textContent = fmt(totals.monthly);
    $('#val-annual').textContent = fmt(totals.annual);
    $('#val-per-user').textContent = state.users > 0 ? fmt(totals.monthly / state.users) : '$0.00';
    $('#sub-daily').textContent = fmtNum(Math.round(first.totalReqs)) + ' requests/day';
    $('#sub-per-user').textContent = fmtNum(Math.round(first.dau)) + ' active users';
    // Pulse animation on value change
    $$('.summary-value').forEach(el => {
        el.classList.remove('value-pulse');
        void el.offsetWidth;
        el.classList.add('value-pulse');
    });
}

// ─── Theme-aware chart colors ───
function getChartColors() {
    const s = getComputedStyle(document.documentElement);
    return {
        inputBg: s.getPropertyValue('--chart-input-bg').trim(),
        inputBorder: s.getPropertyValue('--chart-input-border').trim(),
        outputBg: s.getPropertyValue('--chart-output-bg').trim(),
        outputBorder: s.getPropertyValue('--chart-output-border').trim(),
        text: s.getPropertyValue('--chart-text').trim(),
        grid: s.getPropertyValue('--chart-grid').trim(),
        tick: s.getPropertyValue('--chart-tick').trim(),
        tooltipBg: s.getPropertyValue('--chart-tooltip-bg').trim(),
        tooltipText: s.getPropertyValue('--chart-tooltip-text').trim(),
        tooltipBorder: s.getPropertyValue('--chart-tooltip-border').trim(),
    };
}

// ─── Chart ───
function renderChart(results) {
    const ctx = $('#cost-chart');
    if (!results || results.length === 0) {
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
        return;
    }
    const labels = results.map(r => r.model);
    const inputCosts = results.map(r => r.inputCostDaily * 30);
    const outputCosts = results.map(r => r.outputCostDaily * 30);
    const c = getChartColors();

    const data = {
        labels,
        datasets: [
            { label: 'Input Cost (Monthly)', data: inputCosts, backgroundColor: c.inputBg, borderColor: c.inputBorder, borderWidth: 1, borderRadius: 4 },
            { label: 'Output Cost (Monthly)', data: outputCosts, backgroundColor: c.outputBg, borderColor: c.outputBorder, borderWidth: 1, borderRadius: 4 },
        ],
    };
    const options = {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 400, easing: 'easeOutQuart' },
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { labels: { color: c.text, font: { family: "'Inter',sans-serif", size: 11 }, boxWidth: 12, padding: 16 } },
            tooltip: {
                backgroundColor: c.tooltipBg, titleColor: c.tooltipText, bodyColor: c.tooltipText,
                borderColor: c.tooltipBorder, borderWidth: 1, cornerRadius: 8, padding: 10,
                titleFont: { family: "'Inter',sans-serif", weight: '600' },
                bodyFont: { family: "'IBM Plex Mono',monospace", size: 12 },
                callbacks: { label: (ctx) => `${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` },
            },
        },
        scales: {
            x: { stacked: true, grid: { color: c.grid }, ticks: { color: c.tick, font: { family: "'Inter',sans-serif", size: 10 }, maxRotation: 45 } },
            y: { stacked: true, grid: { color: c.grid }, ticks: { color: c.tick, font: { family: "'IBM Plex Mono',monospace", size: 11 }, callback: v => fmt(v) } },
        },
    };

    if (chartInstance) {
        chartInstance.data = data;
        chartInstance.options = options;
        chartInstance.update('active');
    } else {
        chartInstance = new Chart(ctx, { type: 'bar', data, options });
    }
}

// ─── Model Selector ───
function buildDropdown(filter) {
    const grouped = {};
    MODEL_DB.forEach(m => {
        if (!grouped[m.provider]) grouped[m.provider] = [];
        grouped[m.provider].push(m);
    });
    const lf = filter.toLowerCase();
    let html = '';
    for (const [provider, models] of Object.entries(grouped)) {
        const filtered = models.filter(m => m.model.toLowerCase().includes(lf) || provider.toLowerCase().includes(lf));
        if (!filtered.length) continue;
        html += `<div class="dropdown-group-label">${esc(provider)}</div>`;
        filtered.forEach(m => {
            const sel = state.selectedModels.some(s => s.model === m.model && !s.custom);
            const pin = m.model === PINNED_MODEL;
            html += `<div class="dropdown-item${sel ? ' selected' : ''}" data-model="${esc(m.model)}" data-provider="${esc(m.provider)}">
                <span>${pin ? '<span style="color:var(--gold);margin-right:4px;">&#9670;</span>' : ''}${esc(m.model)}</span>
                <span class="dropdown-item-price">$${m.input} / $${m.output}</span>
            </div>`;
        });
    }
    // Custom models
    state.selectedModels.filter(m => m.custom).forEach(m => {
        if (lf && !m.model.toLowerCase().includes(lf)) return;
        html += `<div class="dropdown-item selected" data-model="${esc(m.model)}" data-custom="true">
            <span>${esc(m.model)} <span style="opacity:.5">(Custom)</span></span>
            <span class="dropdown-item-price">$${m.input} / $${m.output}</span>
        </div>`;
    });
    dom.dropdown.innerHTML = html || '<div style="padding:0.8rem;color:var(--washi-dim);font-size:0.78rem;text-align:center;">No models found</div>';
}

function renderChips() {
    dom.chips.innerHTML = state.selectedModels.map(m => {
        const pin = m.model === PINNED_MODEL && !m.custom;
        const cust = m.custom;
        const cls = pin ? 'chip pinned' : cust ? 'chip custom-chip' : 'chip';
        return `<span class="${cls}">
            ${esc(m.model)}
            <button class="chip-remove" data-model="${esc(m.model)}" data-custom="${!!cust}" aria-label="Remove">&times;</button>
        </span>`;
    }).join('');
}

function toggleModel(modelName, provider, isCustom) {
    const idx = state.selectedModels.findIndex(m => m.model === modelName && (isCustom ? m.custom : !m.custom));
    if (idx > -1) {
        state.selectedModels.splice(idx, 1);
    } else {
        let entry;
        if (isCustom) {
            entry = state.selectedModels.find(m => m.model === modelName && m.custom);
        } else {
            entry = MODEL_DB.find(m => m.model === modelName && m.provider === provider);
        }
        if (entry && !state.selectedModels.some(m => m.model === entry.model && !!m.custom === !!entry.custom)) {
            state.selectedModels.push({ ...entry });
        }
    }
    renderChips();
    buildDropdown(dom.search.value);
    renderAll();
}

// ─── Slider Binding ───
function bindSlider(key, sliderId, inputId) {
    const slider = $(sliderId);
    const input = $(inputId);
    const syncFromInput = () => {
        let v = Number(input.value);
        if (isNaN(v)) return;
        state[key] = v;
        slider.value = Math.min(Number(slider.max), Math.max(Number(slider.min), v));
        fillSlider(slider);
        renderAll();
    };
    const syncFromSlider = () => {
        state[key] = Number(slider.value);
        input.value = state[key];
        fillSlider(slider);
        renderAll();
    };
    slider.addEventListener('input', syncFromSlider);
    input.addEventListener('input', syncFromInput);
    input.addEventListener('change', syncFromInput);
    fillSlider(slider);
}

function fillSlider(slider) {
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    // Intensity gradient: dimmer at low values, full accent at high values
    slider.style.background = `linear-gradient(to right, var(--slider-fill-start) 0%, var(--shu) ${pct}%, var(--slider-track) ${pct}%)`;
    // Glow intensifies with slider value
    const glowSize = Math.round(pct / 12);
    slider.style.filter = glowSize > 1 ? `drop-shadow(0 0 ${glowSize}px var(--shu-glow))` : 'none';
}

// ─── Theme Toggle ───
function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);

    $('#theme-toggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        // Re-render chart with new theme colors
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        renderAll();
    });
}

// ─── Cursor Glitter ───
function initCursorTrail() {
    if (window.matchMedia('(hover: none)').matches) return;
    const canvas = document.getElementById('cursor-trail');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const particles = [];

    function rgb() {
        return document.documentElement.getAttribute('data-theme') === 'light'
            ? '232, 96, 10' : '91, 168, 224';
    }

    document.addEventListener('mousemove', e => {
        if (Math.random() > 0.12) return; // spawn ~12% of events — very sparse
        particles.push({
            x: e.clientX + (Math.random() - 0.5) * 14,
            y: e.clientY + (Math.random() - 0.5) * 14,
            r: 1.2 + Math.random() * 1.6,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.12 - 0.07, // barely drifting upward
            life: 1,
            decay: 0.007 + Math.random() * 0.005, // very slow fade
        });
    });

    (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const c = rgb();
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            if (p.life <= 0) { particles.splice(i, 1); continue; }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c}, ${p.life * p.life * 0.38})`;
            ctx.fill();
        }
        requestAnimationFrame(draw);
    })();
}

// ─── Glass Lighting ───
function initGlassLighting() {
    $$('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
            card.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
        });
    });
}

// ─── Falling Leaves — tilted diagonal sliding ───
function initLeaves() {
    const container = $('#leaves-container');
    if (!container) return;

    function createLeaf() {
        const el = document.createElement('div');
        el.className = 'leaf';
        const size = 16 + Math.random() * 22;

        // Determine direction: slide from left-to-right or right-to-left
        const fromLeft = Math.random() > 0.5;
        const startX = fromLeft ? -(20 + Math.random() * 60) : window.innerWidth + 20 + Math.random() * 60;
        const startY = -(20 + Math.random() * (window.innerHeight * 0.25));

        const duration = 13000 + Math.random() * 16000;
        const rot = Math.random() * 720 - 360;

        // Theme-aware leaf palette
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const palettes = isLight ? [
            // Light theme: warm oranges, amber, burnt sienna
            { h: 18 + Math.random() * 22, s: 65 + Math.random() * 25, l: 50 + Math.random() * 20 },
            { h: 35 + Math.random() * 15, s: 55 + Math.random() * 30, l: 55 + Math.random() * 18 },
            { h: 8 + Math.random() * 10, s: 50 + Math.random() * 25, l: 45 + Math.random() * 20 },
        ] : [
            // Dark theme: icy blues, frost whites, pale lavenders
            { h: 200 + Math.random() * 20, s: 40 + Math.random() * 35, l: 65 + Math.random() * 20 },
            { h: 210 + Math.random() * 15, s: 25 + Math.random() * 30, l: 75 + Math.random() * 15 },
            { h: 230 + Math.random() * 20, s: 30 + Math.random() * 25, l: 70 + Math.random() * 18 },
        ];
        const p = palettes[Math.floor(Math.random() * palettes.length)];
        const op = 0.18 + Math.random() * 0.22;

        el.style.cssText = `left:${startX}px;top:${startY}px;`;

        // Leaf SVG — elongated natural shape
        el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="hsl(${p.h},${p.s}%,${p.l}%)">
            <path d="M12 1C8 5 3 10 3 15c0 3 3 5.5 5 7C9 18.5 10.5 14 12 10.5c1.5 3.5 3 8 4 11.5 2-1.5 5-4 5-7 0-5-5-10-9-14z" opacity="${op}"/>
        </svg>`;

        const vh = window.innerHeight;
        const vw = window.innerWidth;
        // Diagonal travel distance
        const travelX = fromLeft ? (vw * (0.55 + Math.random() * 0.55)) : -(vw * (0.55 + Math.random() * 0.55));
        const travelY = vh + 80;

        const anim = el.animate([
            { transform: `translate(0, 0) rotate(0deg) scale(0.3)`, opacity: 0 },
            { transform: `translate(${travelX * 0.12}px, ${travelY * 0.08}px) rotate(${rot * 0.1}deg) scale(1)`, opacity: op, offset: 0.06 },
            { transform: `translate(${travelX * 0.35}px, ${travelY * 0.3}px) rotate(${rot * 0.35}deg) scale(0.95)`, opacity: op, offset: 0.3 },
            { transform: `translate(${travelX * 0.6}px, ${travelY * 0.55}px) rotate(${rot * 0.6}deg) scale(0.88)`, opacity: op * 0.85, offset: 0.55 },
            { transform: `translate(${travelX * 0.82}px, ${travelY * 0.78}px) rotate(${rot * 0.82}deg) scale(0.7)`, opacity: op * 0.5, offset: 0.78 },
            { transform: `translate(${travelX}px, ${travelY}px) rotate(${rot}deg) scale(0.4)`, opacity: 0 },
        ], { duration, easing: 'ease-in-out', fill: 'forwards' });

        container.appendChild(el);
        anim.onfinish = () => el.remove();
    }

    // Initial burst — more leaves
    for (let i = 0; i < 14; i++) setTimeout(createLeaf, i * 500);

    // Continuous gentle flow — higher density
    setInterval(() => {
        if (container.childElementCount < 28) createLeaf();
    }, 1500);
}

// ─── Parameter Tooltips ───
const PARAM_TOOLTIPS = {
    'Model Selection': 'Choose one or more AI models to compare. Each model has unique pricing for input and output tokens. Select multiple for side-by-side comparison.',
    'Custom Model': 'Add your own model with custom pricing. Useful for comparing private, fine-tuned, or hypothetical pricing scenarios.',
    'Total Active Users': 'Total registered users in your application. Daily active users are calculated from this base using the Daily Active % parameter.',
    'Daily Active %': 'Percentage of users who use AI features daily. 25% means 1 in 4 users makes at least one API request per day. Typical range: 10\u201340%.',
    'Requests / User / Day': 'How many API calls each active user makes daily \u2014 chat messages, completions, summarizations, and any model inference.',
    'Avg Input Tokens / Req': 'Tokens sent to the model per request, including system prompts and context. 1 token \u2248 4 characters in English.',
    'Avg Output Tokens / Req': 'Tokens the model generates per response. Longer answers use more. Output tokens are typically priced higher than input.',
};

function initTooltips() {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-card';
    tooltip.innerHTML = '<div class="tooltip-title"></div><div class="tooltip-body"></div>';
    document.body.appendChild(tooltip);
    const titleEl = tooltip.querySelector('.tooltip-title');
    const bodyEl = tooltip.querySelector('.tooltip-body');
    let hideTimeout;

    function showTooltipFor(label, match) {
        clearTimeout(hideTimeout);
        titleEl.textContent = match;
        bodyEl.textContent = PARAM_TOOLTIPS[match];

        const rect = label.getBoundingClientRect();
        const tooltipW = Math.min(280, window.innerWidth - 24);
        let left = rect.left + rect.width / 2 - tooltipW / 2;
        left = Math.max(12, Math.min(left, window.innerWidth - tooltipW - 12));

        tooltip.style.maxWidth = tooltipW + 'px';
        tooltip.style.left = left + 'px';

        if (rect.top > 200) {
            tooltip.classList.remove('tooltip-below');
            tooltip.classList.add('tooltip-above');
            tooltip.style.top = (rect.top - 10) + 'px';
            tooltip.style.transform = '';
            requestAnimationFrame(() => {
                const th = tooltip.offsetHeight;
                tooltip.style.top = (rect.top - th - 10) + 'px';
                tooltip.classList.add('visible');
            });
        } else {
            tooltip.classList.remove('tooltip-above');
            tooltip.classList.add('tooltip-below');
            tooltip.style.top = (rect.bottom + 10) + 'px';
            tooltip.style.transform = '';
            requestAnimationFrame(() => {
                tooltip.classList.add('visible');
            });
        }
    }

    $$('.control-label').forEach(label => {
        const text = label.textContent.trim();
        const match = Object.keys(PARAM_TOOLTIPS).find(k => text.includes(k));
        if (!match) return;

        label.setAttribute('data-has-tooltip', '');

        label.addEventListener('mouseenter', () => showTooltipFor(label, match));

        label.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
                tooltip.classList.remove('visible');
            }, 120);
        });

        // Touch support — tap to toggle tooltip
        label.addEventListener('touchstart', (e) => {
            if (tooltip.classList.contains('visible') && titleEl.textContent === match) {
                tooltip.classList.remove('visible');
                return;
            }
            e.preventDefault();
            showTooltipFor(label, match);
        }, { passive: false });
    });

    // Dismiss tooltip on tap outside
    document.addEventListener('touchstart', (e) => {
        if (!e.target.closest('[data-has-tooltip]') && !e.target.closest('.tooltip-card')) {
            tooltip.classList.remove('visible');
        }
    });
}

// ─── Custom Model ───
function initCustomModel() {
    dom.customToggle.addEventListener('click', () => {
        dom.customToggle.classList.toggle('active');
        dom.customFields.style.display = dom.customToggle.classList.contains('active') ? 'flex' : 'none';
    });
    dom.addCustom.addEventListener('click', () => {
        const name = dom.customName.value.trim();
        const inp = parseFloat(dom.customInput.value);
        const outp = parseFloat(dom.customOutput.value);
        if (!name) { dom.customName.focus(); return; }
        if (isNaN(inp) || inp < 0) { dom.customInput.focus(); return; }
        if (isNaN(outp) || outp < 0) { dom.customOutput.focus(); return; }
        if (state.selectedModels.some(m => m.model === name && m.custom)) return;
        state.selectedModels.push({ provider: 'Custom', model: name, input: inp, output: outp, custom: true });
        dom.customName.value = '';
        dom.customInput.value = '';
        dom.customOutput.value = '';
        renderChips();
        buildDropdown(dom.search.value);
        renderAll();
    });
}

// ─── Events ───
function initEvents() {
    // Search / dropdown
    dom.search.addEventListener('focus', () => {
        buildDropdown(dom.search.value);
        dom.dropdown.classList.add('open');
    });
    dom.search.addEventListener('input', () => {
        buildDropdown(dom.search.value);
        if (!dom.dropdown.classList.contains('open')) dom.dropdown.classList.add('open');
    });
    document.addEventListener('click', e => {
        if (!e.target.closest('.model-selector')) dom.dropdown.classList.remove('open');
    });

    // Dropdown click
    dom.dropdown.addEventListener('click', e => {
        const item = e.target.closest('.dropdown-item');
        if (!item) return;
        toggleModel(item.dataset.model, item.dataset.provider, item.dataset.custom === 'true');
    });

    // Chip removal
    dom.chips.addEventListener('click', e => {
        const btn = e.target.closest('.chip-remove');
        if (!btn) return;
        const modelName = btn.dataset.model;
        const isCustom = btn.dataset.custom === 'true';
        const idx = state.selectedModels.findIndex(m => m.model === modelName && (isCustom ? m.custom : !m.custom));
        if (idx > -1) {
            state.selectedModels.splice(idx, 1);
            renderChips();
            buildDropdown(dom.search.value);
            renderAll();
        }
    });

    // Sliders
    bindSlider('users', '#slider-users', '#input-users');
    bindSlider('activePct', '#slider-active-pct', '#input-active-pct');
    bindSlider('requestsPerDay', '#slider-requests', '#input-requests');
    bindSlider('inputTokens', '#slider-input-tokens', '#input-input-tokens');
    bindSlider('outputTokens', '#slider-output-tokens', '#input-output-tokens');
}

// ─── Custom Spinner Buttons ───
function initSpinnerButtons() {
    document.querySelectorAll('.spinner-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            if (!target) return;
            const step = parseFloat(btn.dataset.step) || 0.01;
            let val = parseFloat(target.value) || 0;
            if (btn.classList.contains('spinner-up')) {
                val = Math.round((val + step) * 100) / 100;
            } else {
                val = Math.max(0, Math.round((val - step) * 100) / 100);
            }
            target.value = val;
            target.dispatchEvent(new Event('input', { bubbles: true }));
        });
    });
}

// ─── Initialize ───
function init() {
    dom = {
        search:       $('#model-search'),
        dropdown:     $('#model-dropdown'),
        chips:        $('#selected-chips'),
        customToggle: $('#custom-toggle'),
        customFields: $('#custom-fields'),
        customName:   $('#custom-name'),
        customInput:  $('#custom-input-price'),
        customOutput: $('#custom-output-price'),
        addCustom:    $('#add-custom-btn'),
        resultsBody:  $('#results-body'),
    };

    // Default: pin Gemini 3.1 Flash-Lite as selected
    const pinned = MODEL_DB.find(m => m.model === PINNED_MODEL);
    if (pinned) state.selectedModels.push({ ...pinned });

    initTheme(); // Must run before renderAll so chart reads correct CSS vars
    renderChips();
    buildDropdown('');
    renderAll();
    initEvents();
    initCursorTrail();
    initGlassLighting();
    initLeaves();
    initCustomModel();
    initSpinnerButtons();
    initTooltips();
}

document.addEventListener('DOMContentLoaded', init);
