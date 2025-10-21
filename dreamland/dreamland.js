// ===== GERENCIAMENTO DE DADOS =====
class DreamManager {
    constructor() {
        this.dreams = this.loadDreams();
        this.currentView = 'cards';
        this.filters = {
            search: '',
            emotion: ''
        };
    }

    loadDreams() {
        const stored = localStorage.getItem('dreamland_dreams');
        return stored ? JSON.parse(stored) : [];
    }

    saveDreams() {
        localStorage.setItem('dreamland_dreams', JSON.stringify(this.dreams));
    }

    addDream(dream) {
        dream.id = Date.now().toString();
        dream.createdAt = new Date().toISOString();
        this.dreams.unshift(dream);
        this.saveDreams();
        return dream;
    }

    updateDream(id, updatedDream) {
        const index = this.dreams.findIndex(d => d.id === id);
        if (index !== -1) {
            this.dreams[index] = { ...this.dreams[index], ...updatedDream };
            this.saveDreams();
            return this.dreams[index];
        }
        return null;
    }

    deleteDream(id) {
        this.dreams = this.dreams.filter(d => d.id !== id);
        this.saveDreams();
    }

    getDream(id) {
        return this.dreams.find(d => d.id === id);
    }

    getFilteredDreams() {
        return this.dreams.filter(dream => {
            const matchesSearch = !this.filters.search || 
                dream.title.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                dream.description.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                (dream.tags && dream.tags.some(tag => tag.toLowerCase().includes(this.filters.search.toLowerCase())));
            
            const matchesEmotion = !this.filters.emotion || dream.emotion === this.filters.emotion;
            
            return matchesSearch && matchesEmotion;
        });
    }

    getRandomDream() {
        if (this.dreams.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.dreams.length);
        return this.dreams[randomIndex];
    }

    getEmotionStats() {
        const stats = {};
        this.dreams.forEach(dream => {
            stats[dream.emotion] = (stats[dream.emotion] || 0) + 1;
        });
        return stats;
    }

    getSymbolStats() {
        const stats = {};
        this.dreams.forEach(dream => {
            stats[dream.symbol] = (stats[dream.symbol] || 0) + 1;
        });
        return stats;
    }

    getFrequencyByMonth() {
        const frequency = {};
        this.dreams.forEach(dream => {
            const date = new Date(dream.date);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            frequency[monthYear] = (frequency[monthYear] || 0) + 1;
        });
        return frequency;
    }
}

// ===== ANÁLISE POÉTICA =====
class DreamAnalyzer {
    constructor() {
        this.symbols = {
            '🌙': ['mistério', 'feminino', 'intuição', 'ciclos'],
            '⭐': ['esperança', 'desejo', 'destino', 'luz'],
            '🌊': ['emoções', 'inconsciência', 'fluxo', 'mudança'],
            '🌲': ['crescimento', 'estabilidade', 'natureza', 'raízes'],
            '🏠': ['segurança', 'família', 'interior', 'proteção'],
            '🚪': ['oportunidade', 'transição', 'escolha', 'passagem'],
            '🪟': ['perspectiva', 'clareza', 'visão', 'possibilidades'],
            '🦋': ['transformação', 'leveza', 'liberdade', 'renascimento'],
            '🕊️': ['paz', 'pureza', 'mensagem', 'transcendência'],
            '🌺': ['beleza', 'florescimento', 'abertura', 'sensibilidade'],
            '🔑': ['solução', 'acesso', 'descoberta', 'poder'],
            '📖': ['conhecimento', 'história', 'aprendizado', 'memória'],
            '🎭': ['dualidade', 'persona', 'representação', 'emoção'],
            '🌈': ['esperança', 'diversidade', 'renovação', 'promessa'],
            '☁️': ['imaginação', 'leveza', 'transitório', 'sonho'],
            '⚡': ['energia', 'súbito', 'iluminação', 'poder'],
            '🌹': ['amor', 'paixão', 'beleza', 'dualidade'],
            '🦉': ['sabedoria', 'noite', 'visão', 'mistério']
        };

        this.emotions = {
            'paz': ['serenidade', 'harmonia', 'equilíbrio', 'aceitação'],
            'alegria': ['leveza', 'celebração', 'plenitude', 'gratidão'],
            'medo': ['sombra', 'desconhecido', 'proteção', 'alerta'],
            'tristeza': ['profundidade', 'introspecção', 'perda', 'transformação'],
            'saudade': ['memória', 'conexão', 'tempo', 'amor'],
            'amor': ['união', 'entrega', 'abertura', 'vulnerabilidade'],
            'ansiedade': ['movimento', 'futuro', 'controle', 'inquietude'],
            'confusao': ['caos', 'nebulosa', 'busca', 'transição']
        };

        this.templates = [
            'Este sonho sussurra sobre {themes}. Há algo em você que anseia por {desire}.',
            'Entre {themes}, seu inconsciente tece uma história de {desire}.',
            'Um sonho que fala de {themes} — talvez seja hora de contemplar {desire}.',
            'Nas entrelinhas de {themes}, reside um convite para {desire}.',
            'Este sonho é um espelho refletindo {themes}, guiando você em direção a {desire}.'
        ];
    }

    analyze(dream) {
        const symbolThemes = this.symbols[dream.symbol] || ['mistério', 'significado'];
        const emotionThemes = this.emotions[dream.emotion] || ['sentimento', 'experiência'];
        
        const allThemes = [...symbolThemes, ...emotionThemes];
        const selectedThemes = this.selectRandom(allThemes, 2).join(' e ');
        const desire = this.generateDesire(dream.emotion);
        
        const template = this.templates[Math.floor(Math.random() * this.templates.length)];
        return template
            .replace('{themes}', selectedThemes)
            .replace('{desire}', desire);
    }

    selectRandom(arr, count) {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    generateDesire(emotion) {
        const desires = {
            'paz': 'encontrar seu centro',
            'alegria': 'celebrar a vida',
            'medo': 'enfrentar suas sombras',
            'tristeza': 'permitir-se sentir',
            'saudade': 'honrar o que passou',
            'amor': 'abrir seu coração',
            'ansiedade': 'confiar no processo',
            'confusao': 'aceitar a incerteza'
        };
        return desires[emotion] || 'descobrir seu caminho';
    }
}

// ===== RENDERIZAÇÃO =====
class DreamRenderer {
    constructor(manager, analyzer) {
        this.manager = manager;
        this.analyzer = analyzer;
        this.emotionColors = {
            'paz': '#9ed8db',
            'alegria': '#ffd93d',
            'medo': '#8e44ad',
            'tristeza': '#5d9cec',
            'saudade': '#b8a6d9',
            'amor': '#ff7979',
            'ansiedade': '#ff9f43',
            'confusao': '#a8dadc'
        };
        this.emotionLabels = {
            'paz': '🕊️ Paz',
            'alegria': '😊 Alegria',
            'medo': '😨 Medo',
            'tristeza': '😢 Tristeza',
            'saudade': '💭 Saudade',
            'amor': '❤️ Amor',
            'ansiedade': '😰 Ansiedade',
            'confusao': '🌀 Confusão'
        };
    }

    renderDreams() {
        const container = document.getElementById('dreamsContainer');
        const emptyState = document.getElementById('emptyState');
        const dreams = this.manager.getFilteredDreams();

        if (dreams.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        container.className = `dreams-grid ${this.manager.currentView}-view`;
        
        container.innerHTML = dreams.map(dream => this.createDreamCard(dream)).join('');
        
        // Adicionar event listeners
        dreams.forEach(dream => {
            this.attachCardListeners(dream.id);
        });
    }

    createDreamCard(dream) {
        const emotionColor = this.emotionColors[dream.emotion] || '#8b7ba8';
        const emotionLabel = this.emotionLabels[dream.emotion] || dream.emotion;
        const tags = dream.tags || [];
        const formattedDate = this.formatDate(dream.date);

        const cardClass = this.manager.currentView === 'list' ? 'list-item' : 
                         this.manager.currentView === 'gallery' ? 'gallery-item' : '';

        return `
            <div class="dream-card ${cardClass}" data-id="${dream.id}" style="--card-emotion: ${emotionColor}">
                <div class="dream-card-header">
                    <span class="dream-symbol">${dream.symbol}</span>
                    <span class="dream-emotion">${emotionLabel}</span>
                </div>
                <div class="dream-content">
                    <h3 class="dream-title">${this.escapeHtml(dream.title)}</h3>
                    <p class="dream-date">${formattedDate}</p>
                    <p class="dream-description">${this.escapeHtml(dream.description)}</p>
                    ${tags.length > 0 ? `
                        <div class="dream-tags">
                            ${tags.map(tag => `<span class="tag">#${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="dream-actions">
                    <button class="btn-small btn-view" data-id="${dream.id}">👁️ Ver</button>
                    <button class="btn-small btn-edit" data-id="${dream.id}">✏️ Editar</button>
                    <button class="btn-small btn-delete" data-id="${dream.id}">🗑️ Excluir</button>
                </div>
            </div>
        `;
    }

    attachCardListeners(dreamId) {
        const viewBtn = document.querySelector(`.btn-view[data-id="${dreamId}"]`);
        const editBtn = document.querySelector(`.btn-edit[data-id="${dreamId}"]`);
        const deleteBtn = document.querySelector(`.btn-delete[data-id="${dreamId}"]`);

        if (viewBtn) viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDreamView(dreamId);
        });

        if (editBtn) editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            app.openEditModal(dreamId);
        });

        if (deleteBtn) deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteDream(dreamId);
        });
    }

    showDreamView(dreamId) {
        const dream = this.manager.getDream(dreamId);
        if (!dream) return;

        const analysis = this.analyzer.analyze(dream);
        const emotionLabel = this.emotionLabels[dream.emotion] || dream.emotion;
        const formattedDate = this.formatDate(dream.date);
        const tags = dream.tags || [];

        const content = `
            <div class="dream-view-full">
                <div class="dream-view-header">
                    <span class="dream-view-symbol">${dream.symbol}</span>
                    <h2 class="dream-view-title">${this.escapeHtml(dream.title)}</h2>
                    <div class="dream-view-meta">
                        <span class="dream-emotion">${emotionLabel}</span>
                        <span class="dream-date">${formattedDate}</span>
                    </div>
                    ${tags.length > 0 ? `
                        <div class="dream-tags">
                            ${tags.map(tag => `<span class="tag">#${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="dream-view-description">
                    ${this.escapeHtml(dream.description).replace(/\n/g, '<br>')}
                </div>
                <div class="dream-view-analysis">
                    <h3>✨ Análise Poética</h3>
                    <p>${analysis}</p>
                </div>
            </div>
        `;

        document.getElementById('viewModalContent').innerHTML = content;
        document.getElementById('viewModal').classList.add('active');
    }

    deleteDream(dreamId) {
        if (confirm('Tem certeza que deseja excluir este sonho?')) {
            this.manager.deleteDream(dreamId);
            this.renderDreams();
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('pt-BR', options);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ===== GRÁFICOS =====
class ChartManager {
    constructor(manager, renderer) {
        this.manager = manager;
        this.renderer = renderer;
        this.charts = {};
    }

    showCharts() {
        document.getElementById('chartModal').classList.add('active');
        
        // Limpar gráficos anteriores
        if (this.charts.emotions) this.charts.emotions.destroy();
        if (this.charts.frequency) this.charts.frequency.destroy();

        // Criar novos gráficos
        setTimeout(() => {
            this.createEmotionsChart();
            this.createFrequencyChart();
            this.updateStats();
        }, 100);
    }

    createEmotionsChart() {
        const stats = this.manager.getEmotionStats();
        const labels = Object.keys(stats).map(emotion => this.renderer.emotionLabels[emotion] || emotion);
        const data = Object.values(stats);
        const colors = Object.keys(stats).map(emotion => this.renderer.emotionColors[emotion] || '#8b7ba8');

        const ctx = document.getElementById('emotionsChart').getContext('2d');
        this.charts.emotions = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: 'rgba(26, 22, 37, 0.8)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f8f5f0',
                            font: { size: 12, family: 'Georgia' },
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    createFrequencyChart() {
        const frequency = this.manager.getFrequencyByMonth();
        const sortedMonths = Object.keys(frequency).sort((a, b) => {
            const [monthA, yearA] = a.split('/');
            const [monthB, yearB] = b.split('/');
            return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
        });

        const labels = sortedMonths.slice(-6); // Últimos 6 meses
        const data = labels.map(month => frequency[month]);

        const ctx = document.getElementById('frequencyChart').getContext('2d');
        this.charts.frequency = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sonhos registrados',
                    data: data,
                    borderColor: '#d4af37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#d4af37',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#8b7ba8',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(139, 123, 168, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#8b7ba8'
                        },
                        grid: {
                            color: 'rgba(139, 123, 168, 0.1)'
                        }
                    }
                }
            }
        });
    }

    updateStats() {
        const totalDreams = this.manager.dreams.length;
        document.getElementById('totalDreams').textContent = totalDreams;

        // Emoção mais comum
        const emotionStats = this.manager.getEmotionStats();
        const mostCommon = Object.entries(emotionStats).sort((a, b) => b[1] - a[1])[0];
        document.getElementById('mostCommonEmotion').textContent = 
            mostCommon ? this.renderer.emotionLabels[mostCommon[0]] : '—';

        // Símbolo mais comum
        const symbolStats = this.manager.getSymbolStats();
        const mostCommonSymbol = Object.entries(symbolStats).sort((a, b) => b[1] - a[1])[0];
        document.getElementById('mostCommonSymbol').textContent = 
            mostCommonSymbol ? mostCommonSymbol[0] : '—';
    }
}

// ===== EXPORTAÇÃO =====
class ExportManager {
    constructor(manager) {
        this.manager = manager;
    }

    exportAsJSON() {
        const data = {
            exported: new Date().toISOString(),
            totalDreams: this.manager.dreams.length,
            dreams: this.manager.dreams
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.download(blob, `dreamland_backup_${this.getDateString()}.json`);
    }

    exportAsTXT() {
        let content = '🌙 DREAMLAND - DIÁRIO DE SONHOS\n';
        content += '═'.repeat(50) + '\n\n';
        content += `Exportado em: ${new Date().toLocaleDateString('pt-BR')}\n`;
        content += `Total de sonhos: ${this.manager.dreams.length}\n\n`;
        content += '═'.repeat(50) + '\n\n';

        this.manager.dreams.forEach((dream, index) => {
            content += `\n${index + 1}. ${dream.title}\n`;
            content += `${'─'.repeat(50)}\n`;
            content += `${dream.symbol} | Data: ${new Date(dream.date).toLocaleDateString('pt-BR')}\n`;
            content += `Emoção: ${dream.emotion}\n`;
            if (dream.tags && dream.tags.length > 0) {
                content += `Tags: ${dream.tags.join(', ')}\n`;
            }
            content += `\n${dream.description}\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        this.download(blob, `dreamland_sonhos_${this.getDateString()}.txt`);
    }

    download(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getDateString() {
        const now = new Date();
        return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    }
}

// ===== APLICAÇÃO PRINCIPAL =====
class DreamlandApp {
    constructor() {
        this.manager = new DreamManager();
        this.analyzer = new DreamAnalyzer();
        this.renderer = new DreamRenderer(this.manager, this.analyzer);
        this.chartManager = new ChartManager(this.manager, this.renderer);
        this.exportManager = new ExportManager(this.manager);
        
        this.initializeEventListeners();
        this.renderer.renderDreams();
        this.setTodayDate();
    }

    initializeEventListeners() {
        // Botões principais
        document.getElementById('newDreamBtn').addEventListener('click', () => this.openNewModal());
        document.getElementById('randomDreamBtn').addEventListener('click', () => this.showRandomDream());
        document.getElementById('chartBtn').addEventListener('click', () => this.chartManager.showCharts());
        document.getElementById('exportBtn').addEventListener('click', () => this.openExportModal());

        // Formulário
        document.getElementById('dreamForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal('dreamModal'));

        // Modals
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal('dreamModal'));
        document.getElementById('closeViewModal').addEventListener('click', () => this.closeModal('viewModal'));
        document.getElementById('closeChartModal').addEventListener('click', () => this.closeModal('chartModal'));
        document.getElementById('closeExportModal').addEventListener('click', () => this.closeModal('exportModal'));

        // Fechar modal ao clicar fora
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Filtros
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.manager.filters.search = e.target.value;
            this.renderer.renderDreams();
        });

        document.getElementById('emotionFilter').addEventListener('change', (e) => {
            this.manager.filters.emotion = e.target.value;
            this.renderer.renderDreams();
        });

        // Visualizações
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.manager.currentView = e.target.dataset.view;
                this.renderer.renderDreams();
            });
        });

        // Exportação
        document.getElementById('exportJsonBtn').addEventListener('click', () => {
            this.exportManager.exportAsJSON();
            this.closeModal('exportModal');
        });

        document.getElementById('exportTxtBtn').addEventListener('click', () => {
            this.exportManager.exportAsTXT();
            this.closeModal('exportModal');
        });
    }

    openNewModal() {
        document.getElementById('modalTitle').textContent = '✨ Novo Sonho';
        document.getElementById('dreamForm').reset();
        document.getElementById('dreamId').value = '';
        this.setTodayDate();
        document.getElementById('dreamModal').classList.add('active');
    }

    openEditModal(dreamId) {
        const dream = this.manager.getDream(dreamId);
        if (!dream) return;

        document.getElementById('modalTitle').textContent = '✏️ Editar Sonho';
        document.getElementById('dreamId').value = dream.id;
        document.getElementById('dreamTitle').value = dream.title;
        document.getElementById('dreamDate').value = dream.date;
        document.getElementById('dreamDescription').value = dream.description;
        document.getElementById('dreamEmotion').value = dream.emotion;
        document.getElementById('dreamSymbol').value = dream.symbol;
        document.getElementById('dreamTags').value = dream.tags ? dream.tags.join(', ') : '';
        
        document.getElementById('dreamModal').classList.add('active');
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const dreamData = {
            title: document.getElementById('dreamTitle').value,
            date: document.getElementById('dreamDate').value,
            description: document.getElementById('dreamDescription').value,
            emotion: document.getElementById('dreamEmotion').value,
            symbol: document.getElementById('dreamSymbol').value,
            tags: document.getElementById('dreamTags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag)
        };

        const dreamId = document.getElementById('dreamId').value;
        
        if (dreamId) {
            this.manager.updateDream(dreamId, dreamData);
        } else {
            this.manager.addDream(dreamData);
        }

        this.closeModal('dreamModal');
        this.renderer.renderDreams();
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    showRandomDream() {
        const dream = this.manager.getRandomDream();
        if (dream) {
            this.renderer.showDreamView(dream.id);
        } else {
            alert('Você ainda não tem sonhos registrados.');
        }
    }

    openExportModal() {
        if (this.manager.dreams.length === 0) {
            alert('Você ainda não tem sonhos para exportar.');
            return;
        }
        document.getElementById('exportModal').classList.add('active');
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dreamDate').value = today;
    }
}

// ===== INICIALIZAÇÃO =====
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new DreamlandApp();
});

