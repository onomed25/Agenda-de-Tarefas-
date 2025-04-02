let todos = [];
let dailyStats = {};

function loadDataFromCookies() {
    const todosCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('todos='));
    if (todosCookie) {
        todos = JSON.parse(decodeURIComponent(todosCookie.split('=')[1]));
    }
    
    const statsCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('dailyStats='));
    if (statsCookie) {
        dailyStats = JSON.parse(decodeURIComponent(statsCookie.split('=')[1]));
    } else {
        initializeStats();
    }
    
    checkDayChange();
    renderTodos();
    renderChart();
}

function initializeStats() {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        const dateStr = date.toDateString();
        dailyStats[dateStr] = {
            completed: i === 6 ? todos.filter(todo => todo.completed).length : 0,
            total: i === 6 ? todos.length : 0
        };
    }
}

function checkDayChange() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('lastDate') || today;

    if (lastDate !== today) {
        // Desmarca todas as tarefas concluídas
        todos.forEach(todo => todo.completed = false);

        const newStats = {};
        const todayDate = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(todayDate);
            date.setDate(todayDate.getDate() - (6 - i));
            const dateStr = date.toDateString();
            if (i === 6) {
                newStats[dateStr] = {
                    completed: todos.filter(todo => todo.completed).length, // Será 0 após desmarcar
                    total: todos.length
                };
            } else {
                const prevDate = new Date(todayDate);
                prevDate.setDate(todayDate.getDate() - (7 - i));
                newStats[dateStr] = dailyStats[prevDate.toDateString()] || { completed: 0, total: 0 };
            }
        }
        
        dailyStats = newStats;
        localStorage.setItem('lastDate', today);
        saveDataInCookies();
        renderTodos(); // Atualiza a lista imediatamente
        renderChart(); // Atualiza o gráfico imediatamente
    }
}

function saveDataInCookies() {
    document.cookie = `todos=${encodeURIComponent(JSON.stringify(todos))}; path=/; max-age=31536000`;
    document.cookie = `dailyStats=${encodeURIComponent(JSON.stringify(dailyStats))}; path=/; max-age=31536000`;
}

function addTodo() {
    const taskInput = document.getElementById('new-todo');
    const timeInput = document.getElementById('task-time');
    if (!taskInput || !timeInput) return;

    const taskText = taskInput.value.trim();
    const taskTime = timeInput.value;

    if (taskText && taskTime) {
        const newTodo = {
            id: Date.now(),
            text: taskText,
            time: taskTime,
            completed: false
        };
        todos.push(newTodo);

        todos.sort((a, b) => a.time.localeCompare(b.time));

        updateTodayStats();
        saveDataInCookies();
        renderTodos();
        renderChart();

        taskInput.value = '';
        timeInput.value = '';
    } else {
        alert('Por favor, adicione uma tarefa e um horário.');
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        updateTodayStats();
        saveDataInCookies();
        renderTodos();
        renderChart();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    updateTodayStats();
    saveDataInCookies();
    renderTodos();
    renderChart();
}

function unmarkAll() {
    todos.forEach(todo => todo.completed = false);
    updateTodayStats();
    saveDataInCookies();
    renderTodos();
    renderChart();
}

function updateTodayStats() {
    const today = new Date().toDateString();
    dailyStats[today] = {
        completed: todos.filter(t => t.completed).length,
        total: todos.length
    };
}

function updateProgress() {
    const completedCount = todos.filter(todo => todo.completed).length;
    const totalCount = todos.length;
    const percentage = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

    const progressCircle = document.querySelector('.progress-ring .progress-circle');
    if (progressCircle) {
        const strokeDashoffset = 226.195 - (percentage / 100) * 226.195;
        progressCircle.style.strokeDashoffset = strokeDashoffset;
    }

    const progressText = document.getElementById('progress-text');
    if (progressText) {
        progressText.textContent = `${percentage}%`;
    }
}

function renderTodos() {
    const taskList = document.getElementById('task-list');
    if (!taskList) {
        console.error('Elemento task-list não encontrado no DOM');
        return;
    }

    taskList.innerHTML = '';

    todos.forEach(todo => {
        const li = document.createElement('li');
        const taskContent = document.createElement('span');
        taskContent.className = 'task-content';
        taskContent.textContent = `${todo.text} - ${todo.time}`;
        if (todo.completed) {
            taskContent.classList.add('completed');
        }

        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onclick="toggleTodo(${todo.id})" />
        `;
        li.appendChild(taskContent);
        li.innerHTML += `
            <button onclick="deleteTodo(${todo.id})">🗑️</button>
        `;
        taskList.appendChild(li);
    });

    updateProgress();
}

function renderChart() {
    const ctx = document.getElementById('dailyTasksChart');
    if (!ctx) {
        console.error('Elemento dailyTasksChart não encontrado no DOM');
        return;
    }

    const context = ctx.getContext('2d');
    const today = new Date();
    const labels = [];
    const data = [];
    const percentages = [];
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        const dateStr = date.toDateString();
        const stats = dailyStats[dateStr] || { completed: 0, total: 0 };
        labels.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }));
        data.push(stats.completed);
        percentages.push(stats.total ? Math.round((stats.completed / stats.total) * 100) : 0);
    }

    if (window.myChart) {
        window.myChart.destroy();
    }

    try {
        window.myChart = new Chart(context, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tarefas Concluídas',
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                const index = context.dataIndex;
                                const completed = data[index];
                                const percentage = percentages[index];
                                return `Concluídas: ${completed} (${percentage}%)`;
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        console.log(`Dia: ${labels[index]}, Porcentagem: ${percentages[index]}%`);
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao criar o gráfico:', error);
    }
}

window.onload = function() {
    try {
        loadDataFromCookies();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
};