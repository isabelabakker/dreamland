// Estado global
let currentView = 'loading';
let dreams = [];
let selectedDreamId = null;
let db = null;
let emotionChartInstance = null;

// Configuração de emoções
const emotionConfig = {
    default: { color: 'border-slate-600', bg: 'bg-slate-800/30', icon: '😶' },
    paz: { color: 'border-blue-400', bg: 'bg-blue-900/30', icon: '😌' },
    alegria: { color: 'border-yellow-300', bg: 'bg-yellow-800/30', icon: '😄' },
    medo: { color: 'border-red-400', bg: 'bg-red-900/30', icon: '😨' },
    saudade: { color: 'border-gray-400', bg: 'bg-gray-700/30', icon: '🥺' },
    confusao: { color: 'border-purple-400', bg: 'bg-purple-900/30', icon: '😵‍💫' },
};

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Oniria...');
    
    // Garante que os modais estejam fechados
    closeAllModals();
    
    // Configura localização
    dayjs.locale('pt-br');
    
    // Inicializa ícones
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
        console.log('✅ Ícones inicializados');
    }
    
    // Configura banco de dados
    setupDatabase();
    
    // Configura event listeners
    setupEventListeners();
    
    // Gera estrelas
    generateStars();
    
    // Navega para loading inicial
    navigateTo('loading');
    
    console.log('✅ Oniria inicializado com sucesso!');
});

// Função para fechar todos os modais
function closeAllModals() {
    const analysisModal = document.getElementById('analysis-modal');
    const deleteModal = document.getElementById('delete-modal');
    
    if (analysisModal) {
        analysisModal.style.display = 'none';
        analysisModal.classList.remove('visible');
    }
    
    if (deleteModal) {
        deleteModal.style.display = 'none';
        deleteModal.classList.remove('visible');
    }
    
    console.log('🚫 Todos os modais fechados');
}

// Configuração do IndexedDB
function setupDatabase() {
    const request = window.indexedDB.open("OniriaDB", 1);

    request.onerror = (event) => {
        console.error("❌ Erro ao abrir o IndexedDB:", event);
        navigateTo('list');
        showEmptyMessage("Erro ao carregar o banco de dados local.");
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        const store = db.createObjectStore("dreams", { keyPath: "id", autoIncrement: true });
        store.createIndex("date", "date", { unique: false });
        store.createIndex("emotion", "emotion", { unique: false });
        console.log('✅ Banco de dados criado');
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log("✅ Banco de dados IndexedDB aberto com sucesso");
        loadDreamsFromDB();
    };
}

// Carrega sonhos do banco
function loadDreamsFromDB() {
    if (!db) return;

    const transaction = db.transaction(["dreams"], "readonly");
    const store = transaction.objectStore("dreams");
    const request = store.getAll();

    request.onsuccess = (event) => {
        let allDreams = event.target.result;
        allDreams.sort((a, b) => new Date(b.date) - new Date(a.date));
        dreams = allDreams;
        
        console.log(`📚 Carregados ${dreams.length} sonhos`);
        renderDreamList();
        
        if (currentView === 'loading') {
            navigateTo('list');
        }
    };

    request.onerror = (event) => {
        console.error("❌ Erro ao carregar sonhos do DB:", event);
        navigateTo('list');
        showEmptyMessage("Erro ao carregar sonhos.");
    };
}

// Navegação entre views
function navigateTo(viewName) {
    console.log(`🧭 Navegando para: ${viewName}`);
    currentView = viewName;
    
    // Esconde todas as views
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
    });
    
    // Mostra a view ativa
    const activeView = document.getElementById(viewName + '-view');
    if (activeView) {
        activeView.classList.add('active');
    }
    
    // Atualiza estado ativo dos botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.view === viewName) {
            btn.classList.remove('text-slate-400', 'hover:text-slate-200');
            btn.classList.add('text-violet-300');
        } else {
            btn.classList.remove('text-violet-300');
            btn.classList.add('text-slate-400', 'hover:text-slate-200');
        }
    });

    // Lógica específica ao entrar na view
    if (viewName === 'journal') {
        renderJournalView();
    }
    if (viewName === 'explore') {
        renderExploreView();
    }

    // Renderiza ícones após mudança de view
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 50);
}

// Salva sonho
async function handleSaveDream(event) {
    event.preventDefault();
    console.log('💾 Salvando sonho...');
    
    if (!db) return;

    const formData = new FormData(event.target);
    const dreamData = Object.fromEntries(formData.entries());

    if (!dreamData.title || !dreamData.description) {
        console.warn("⚠️ Título e Descrição são obrigatórios");
        return;
    }

    navigateTo('loading');

    const transaction = db.transaction(["dreams"], "readwrite");
    const store = transaction.objectStore("dreams");
    
    const dataToSave = {
        title: dreamData.title,
        description: dreamData.description,
        tags: dreamData.tags,
        emotion: dreamData.emotion,
        symbol: dreamData.symbol,
        date: new Date(dreamData.date || Date.now()).toISOString()
    };

    const id = dreamData.id ? parseInt(dreamData.id) : null;
    let request;

    if (id) {
        dataToSave.id = id;
        request = store.put(dataToSave);
        console.log('📝 Atualizando sonho existente');
    } else {
        request = store.add(dataToSave);
        console.log('➕ Adicionando novo sonho');
    }

    transaction.oncomplete = () => {
        console.log("✅ Sonho salvo com sucesso");
        event.target.reset();
        loadDreamsFromDB();
        navigateTo('list');
    };

    transaction.onerror = (event) => {
        console.error("❌ Erro ao salvar sonho:", event);
        navigateTo('list');
    };
}

// Exclui sonho
function handleDeleteDream(dreamId) {
    console.log('🗑️ Excluindo sonho:', dreamId);
    selectedDreamId = dreamId;
    const deleteModal = document.getElementById('delete-modal');
    deleteModal.style.display = 'flex';
    deleteModal.classList.add('visible');
}

async function confirmDelete() {
    if (!db || selectedDreamId === null) return;

    console.log('🗑️ Confirmando exclusão...');
    const idToDelete = selectedDreamId;
    const deleteModal = document.getElementById('delete-modal');
    deleteModal.style.display = 'none';
    deleteModal.classList.remove('visible');
    navigateTo('loading');

    const transaction = db.transaction(["dreams"], "readwrite");
    const store = transaction.objectStore("dreams");
    const request = store.delete(idToDelete);

    transaction.oncomplete = () => {
        console.log("✅ Sonho apagado com sucesso");
        selectedDreamId = null;
        loadDreamsFromDB();
        navigateTo('list');
    };
    
    transaction.onerror = (event) => {
        console.error("❌ Erro ao apagar sonho:", event);
        navigateTo('detail');
    };
}

// Mostra formulário de sonho
function showDreamForm(dreamId = null) {
    console.log('📝 Abrindo formulário:', dreamId ? 'edição' : 'novo');
    
    if (dreamId) {
        const dream = dreams.find(d => d.id === dreamId);
        if (!dream) return;
        
        document.getElementById('form-title').textContent = 'Editar Sonho';
        document.getElementById('dream-id-input').value = dream.id;
        document.getElementById('title').value = dream.title;
        document.getElementById('description').value = dream.description;
        document.getElementById('date').value = dayjs(dream.date).format('YYYY-MM-DD');
        document.getElementById('tags').value = dream.tags || '';
        document.getElementById('emotion').value = dream.emotion || 'paz';
        document.getElementById('symbol').value = dream.symbol || '';
    } else {
        document.getElementById('form-title').textContent = 'Novo Sonho';
        document.getElementById('dream-form').reset();
        document.getElementById('dream-id-input').value = '';
        document.getElementById('date').value = dayjs().format('YYYY-MM-DD');
        document.getElementById('emotion').value = 'paz';
        document.getElementById('symbol').value = emotionConfig['paz'].icon;
    }
    navigateTo('form');
}

// Mostra detalhes do sonho
function showDreamDetail(dreamId) {
    console.log('👁️ Mostrando detalhes do sonho:', dreamId);
    
    const dream = dreams.find(d => d.id === dreamId);
    if (!dream) return;
    
    selectedDreamId = dream.id;
    const config = emotionConfig[dream.emotion] || emotionConfig.default;

    const detailHeader = document.getElementById('detail-header');
    detailHeader.className = `relative p-5 rounded-xl shadow-lg -mx-4 -mt-4 border-b backdrop-blur-sm ${config.color} ${config.bg}`;
    
    document.getElementById('detail-title').textContent = dream.title;
    document.getElementById('detail-date').textContent = dayjs(dream.date).format('dddd, DD [de] MMMM [de] YYYY');
    document.getElementById('detail-symbol').textContent = dream.symbol || config.icon;
    document.getElementById('detail-description').textContent = dream.description;
    
    const detailTagsContainer = document.getElementById('detail-tags-container');
    detailTagsContainer.innerHTML = `
        <span class="px-3 py-1 rounded-full text-sm font-medium border ${config.color} ${config.bg.replace('/30', '/50')}">
            ${escapeHTML(dream.emotion)}
        </span>
        ${dream.tags?.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => `
            <span class="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
                ${escapeHTML(tag)}
            </span>
        `).join('') || ''}
    `;
    
    navigateTo('detail');
}

// Renderiza lista de sonhos
function renderDreamList() {
    console.log('📋 Renderizando lista de sonhos...');
    
    const container = document.getElementById('dream-list-container');
    const emptyMessage = document.getElementById('empty-list-message');
    
    container.innerHTML = '';
    
    if (dreams.length === 0) {
        emptyMessage.classList.remove('hidden');
    } else {
        emptyMessage.classList.add('hidden');
        dreams.forEach((dream, index) => {
            const card = createDreamCard(dream, index);
            container.appendChild(card);
        });
    }
    
    // Renderiza ícones após atualizar DOM
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 50);
}

// Cria card de sonho
function createDreamCard(dream, index) {
    const config = emotionConfig[dream.emotion] || emotionConfig.default;
    
    const card = document.createElement('div');
    card.className = `dream-card relative p-4 rounded-xl shadow-lg cursor-pointer transition-all duration-300 border ${config.color} ${config.bg} backdrop-blur-sm hover:shadow-violet-400/20 hover:border-violet-400`;
    card.style.animationDelay = `${index * 0.05}s`;
    card.dataset.id = dream.id;
    
    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <h3 class="text-xl font-medium text-gray-100">${escapeHTML(dream.title)}</h3>
                <p class="text-sm text-slate-400 mt-1">${dayjs(dream.date).format('DD [de] MMMM, YYYY')}</p>
            </div>
            <span class="text-3xl ml-4 opacity-80">${escapeHTML(dream.symbol) || config.icon}</span>
        </div>
        <p class="mt-3 text-sm text-gray-300 line-clamp-2">${escapeHTML(dream.description)}</p>
        <div class="mt-3 flex flex-wrap gap-2">
            ${dream.tags?.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => `
                <span class="tag px-2 py-0.5 text-slate-300 rounded-full text-xs">
                    ${escapeHTML(tag)}
                </span>
            `).join('') || ''}
        </div>
    `;
    
    card.addEventListener('click', () => showDreamDetail(dream.id));
    return card;
}

// Renderiza view do diário
function renderJournalView() {
    console.log('📊 Renderizando diário...');
    
    if (emotionChartInstance) {
        emotionChartInstance.destroy();
    }

    const canvas = document.getElementById('emotion-chart');
    const emptyMsg = document.getElementById('journal-empty-msg');

    if (dreams.length === 0) {
        emptyMsg.classList.remove('hidden');
        canvas.style.display = 'none';
        return;
    }
    
    emptyMsg.classList.add('hidden');
    canvas.style.display = 'block';

    const emotionCounts = dreams.reduce((acc, dream) => {
        const emotion = dream.emotion || 'default';
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
    }, {});
    
    const labels = Object.keys(emotionCounts);
    const data = Object.values(emotionCounts);

    const getChartColor = (label, type) => {
        const color = (emotionConfig[label] || emotionConfig.default).color;
        const opacity = type === 'bg' ? '0.6' : '1';
        if (color.includes('blue')) return `rgba(96, 165, 250, ${opacity})`;
        if (color.includes('yellow')) return `rgba(252, 211, 77, ${opacity})`;
        if (color.includes('red')) return `rgba(248, 113, 113, ${opacity})`;
        if (color.includes('gray')) return `rgba(156, 163, 175, ${opacity})`;
        if (color.includes('purple')) return `rgba(192, 132, 252, ${opacity})`;
        return `rgba(100, 116, 139, ${opacity})`;
    };

    emotionChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequência de Emoções',
                data: data,
                backgroundColor: labels.map(l => getChartColor(l, 'bg')),
                borderColor: labels.map(l => getChartColor(l, 'border')),
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Emoções Recorrentes', color: '#e2e8f0' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94a3b8', stepSize: 1 },
                    grid: { color: '#334155' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                }
            }
        }
    });
}

// Renderiza view de exploração
function renderExploreView() {
    console.log('🔍 Renderizando exploração...');
    updateFilterResults();
}

// Atualiza resultados do filtro
function updateFilterResults() {
    const keyword = document.getElementById('filter-keyword').value.toLowerCase();
    const tag = document.getElementById('filter-tag').value.toLowerCase();
    const emotion = document.getElementById('filter-emotion').value;

    const filteredDreams = dreams.filter(dream => {
        const keywordMatch = keyword ? 
            (dream.title.toLowerCase().includes(keyword) || 
             dream.description.toLowerCase().includes(keyword)) : true;
        
        const tagMatch = tag ? 
            (dream.tags && dream.tags.toLowerCase().includes(tag)) : true;
        
        const emotionMatch = emotion ? 
            (dream.emotion === emotion) : true;
            
        return keywordMatch && tagMatch && emotionMatch;
    });

    document.getElementById('filter-results-count').textContent = `Resultados (${filteredDreams.length})`;
    const container = document.getElementById('filter-results-container');
    const emptyMsg = document.getElementById('filter-empty-msg');
    
    container.innerHTML = '';
    
    if (filteredDreams.length > 0) {
        emptyMsg.classList.add('hidden');
        filteredDreams.forEach(dream => {
            const div = document.createElement('div');
            div.className = 'p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors';
            div.innerHTML = `
                <h4 class="font-medium text-gray-200 truncate">${escapeHTML(dream.title)}</h4>
                <p class="text-sm text-slate-400">${dayjs(dream.date).format('DD/MM/YYYY')}</p>
            `;
            div.addEventListener('click', () => showDreamDetail(dream.id));
            container.appendChild(div);
        });
    } else {
        emptyMsg.classList.remove('hidden');
    }
    
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 50);
}

// Análise poética
async function handleGetAnalysis() {
    console.log('🔮 Iniciando análise poética...');
    
    const dream = dreams.find(d => d.id === selectedDreamId);
    if (!dream || !dream.description) return;

    const modal = document.getElementById('analysis-modal');
    const loading = document.getElementById('analysis-loading');
    const error = document.getElementById('analysis-error');
    const text = document.getElementById('analysis-text');

    modal.style.display = 'flex';
    modal.classList.add('visible');
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    text.classList.add('hidden');
    text.textContent = '';
    error.textContent = '';

    const systemPrompt = "Você é Oniria, um poeta místico e intérprete de sonhos. Você nunca dá conselhos diretos ou interpretações literais. Em vez disso, responde em linguagem simbólica, poética, gentil e curta (máximo 3 frases), interpretando o sonho fornecido. Fale em português do Brasil. Comece com 'Este sonho sussurra sobre...'.";
    
    const apiKey = ""; // Deixe em branco
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: dream.description }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };
    
    try {
        let response;
        for (let i = 0; i < 3; i++) {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) break;
            if (response.status === 429 || response.status >= 500) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            } else {
                break;
            }
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const result = await response.json();
        const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (analysisText) {
            text.textContent = `"${analysisText}"`;
            text.classList.remove('hidden');
        } else {
            throw new Error("Resposta da API inválida.");
        }
    } catch (error) {
        console.error("❌ Erro na análise poética:", error);
        error.textContent = "Não foi possível interpretar este sonho agora. Tente mais tarde.";
        error.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

// Exporta dados
function handleExport() {
    console.log('📤 Exportando dados...');
    try {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dreams, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `oniria_backup_${dayjs().format('YYYY-MM-DD')}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        console.log('✅ Dados exportados com sucesso');
    } catch (error) {
        console.error("❌ Erro ao exportar:", error);
    }
}

// Sonho aleatório
function handleRandomDream() {
    console.log('🎲 Selecionando sonho aleatório...');
    if (dreams.length === 0) return;
    const randomDream = dreams[Math.floor(Math.random() * dreams.length)];
    showDreamDetail(randomDream.id);
}

// Gera estrelas
function generateStars() {
    console.log('⭐ Gerando estrelas...');
    const container = document.getElementById('star-container');
    let starsHTML = '';
    for (let i = 0; i < 50; i++) {
        const style = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            width: ${Math.random() * 2 + 1}px;
            height: ${Math.random() * 2 + 1}px;
            animation-delay: ${Math.random() * 5}s;
            animation-duration: ${Math.random() * 5 + 3}s;
        `;
        starsHTML += `<div class="star" style="${style}"></div>`;
    }
    container.innerHTML = starsHTML;
}

// Escapa HTML
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return str.toString()
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&#039;');
}

// Mostra mensagem vazia
function showEmptyMessage(message) {
    const emptyMessage = document.getElementById('empty-list-message');
    emptyMessage.innerHTML = `<p class='text-red-400'>${message}</p>`;
    emptyMessage.classList.remove('hidden');
}

// Configura event listeners - VERSÃO SIMPLIFICADA E ROBUSTA
function setupEventListeners() {
    console.log('🎯 Configurando event listeners...');
    
    // Event listeners diretos para botões principais
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const view = btn.dataset.view;
            console.log('🧭 Navegando para:', view);
            if (view) {
                navigateTo(view);
            }
        });
    });
    
    const addNewBtn = document.getElementById('add-new-btn-nav');
    if (addNewBtn) {
        addNewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('➕ Adicionando novo sonho');
            showDreamForm(null);
        });
    }
    
    const addFirstBtn = document.getElementById('add-first-dream-btn');
    if (addFirstBtn) {
        addFirstBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🌟 Primeiro sonho');
            showDreamForm(null);
        });
    }
    
    const backButtons = document.querySelectorAll('.nav-back-btn');
    backButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⬅️ Voltando');
            navigateTo('list');
        });
    });
    
    // Event delegation para outros botões
    document.addEventListener('click', function(e) {
        // Só processa se não for um modal visível
        if (document.getElementById('analysis-modal').classList.contains('visible') ||
            document.getElementById('delete-modal').classList.contains('visible')) {
            return;
        }
        
        console.log('🖱️ Clique detectado em:', e.target.tagName, e.target.className, e.target.id);
        
        // Botões de detalhe
        if (e.target.closest('#analyze-btn')) {
            console.log('🔮 Analisando');
            handleGetAnalysis();
            return;
        }
        if (e.target.closest('#edit-btn')) {
            console.log('✏️ Editando');
            showDreamForm(selectedDreamId);
            return;
        }
        if (e.target.closest('#delete-btn')) {
            console.log('🗑️ Excluindo');
            handleDeleteDream(selectedDreamId);
            return;
        }
        
        // Botões de exploração
        if (e.target.closest('#random-dream-btn')) {
            console.log('🎲 Sonho aleatório');
            handleRandomDream();
            return;
        }
        if (e.target.closest('#export-btn')) {
            console.log('📤 Exportando');
            handleExport();
            return;
        }
        
        // Modais
        if (e.target.closest('#analysis-modal-close')) {
            console.log('❌ Fechando modal de análise');
            const modal = document.getElementById('analysis-modal');
            modal.style.display = 'none';
            modal.classList.remove('visible');
            return;
        }
        if (e.target.closest('#delete-modal-cancel')) {
            console.log('❌ Cancelando exclusão');
            const modal = document.getElementById('delete-modal');
            modal.style.display = 'none';
            modal.classList.remove('visible');
            return;
        }
        if (e.target.closest('#delete-modal-confirm')) {
            console.log('✅ Confirmando exclusão');
            confirmDelete();
            return;
        }
    });

    // Formulário
    const dreamForm = document.getElementById('dream-form');
    if (dreamForm) {
        dreamForm.addEventListener('submit', handleSaveDream);
        console.log('📝 Formulário configurado');
        
        // Atualiza emoji ao mudar emoção
        const emotionSelect = dreamForm.elements['emotion'];
        if (emotionSelect) {
            emotionSelect.addEventListener('change', (e) => {
                const currentSymbol = dreamForm.elements['symbol'].value;
                const newIcon = emotionConfig[e.target.value]?.icon || '🤔';
                
                const isOldIcon = Object.values(emotionConfig).some(c => c.icon === currentSymbol);
                if (!currentSymbol || isOldIcon) {
                    dreamForm.elements['symbol'].value = newIcon;
                }
            });
        }
    }

    // Filtros
    const filterInputs = ['filter-keyword', 'filter-tag', 'filter-emotion'];
    filterInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateFilterResults);
        }
    });
    console.log('🔍 Filtros configurados');

    // Modais - clique fora para fechar
    const analysisModal = document.getElementById('analysis-modal');
    if (analysisModal) {
        analysisModal.addEventListener('click', (e) => {
            if (e.target === analysisModal) {
                analysisModal.style.display = 'none';
                analysisModal.classList.remove('visible');
            }
        });
    }
    
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                deleteModal.style.display = 'none';
                deleteModal.classList.remove('visible');
            }
        });
    }
    
    console.log('✅ Todos os event listeners configurados!');
}
