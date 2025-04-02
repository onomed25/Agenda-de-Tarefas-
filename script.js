let todos = [];
let dailyStats = {};

function loadDataFromLocalStorage() {
    const todosData = localStorage.getItem('todos');
    if (todosData) todos = JSON.parse(todosData);

    const statsData = localStorage.getItem('dailyStats');
    if (statsData) {
        dailyStats = JSON.parse(statsData);
    } else {
        initializeStats();
    }

    checkDayChange();
    renderTodos();
    renderChart();
    scheduleTaskNotifications();
    loadDarkMode();
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
        todos.forEach(todo => todo.completed = false);

        const newStats = {};
        const todayDate = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(todayDate);
            date.setDate(todayDate.getDate() - (6 - i));
            const dateStr = date.toDateString();
            if (i === 6) {
                newStats[dateStr] = {
                    completed: todos.filter(todo => todo.completed).length,
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
        saveDataInLocalStorage();
        renderTodos();
        renderChart();
    }
}

function saveDataInLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('dailyStats', JSON.stringify(dailyStats));
}

function addTodo() {
    const taskInput = document.getElementById('new-todo');
    const timeInput = document.getElementById('task-time');
    const priorityInput = document.getElementById('task-priority');
    if (!taskInput || !timeInput || !priorityInput) return;

    const taskText = taskInput.value.trim();
    const taskTime = timeInput.value;
    const taskPriority = priorityInput.value;

    if (taskText && taskTime && taskPriority) {
        const newTodo = {
            id: Date.now(),
            text: taskText,
            time: taskTime,
            priority: taskPriority,
            completed: false
        };
        todos.push(newTodo);
        todos.sort((a, b) => a.time.localeCompare(b.time));
        updateTodayStats();
        saveDataInLocalStorage();
        renderTodos();
        renderChart();
        scheduleTaskNotifications();
        taskInput.value = '';
        timeInput.value = '';
        priorityInput.value = 'medium';
    } else {
        alert('Por favor, adicione uma tarefa, horário e prioridade.');
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        updateTodayStats();
        saveDataInLocalStorage();
        renderTodos();
        renderChart();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    updateTodayStats();
    saveDataInLocalStorage();
    renderTodos();
    renderChart();
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        const newText = prompt("Editar tarefa:", todo.text);
        const newTime = prompt("Editar horário (HH:MM):", todo.time);
        const newPriority = prompt("Editar prioridade (high, medium, low):", todo.priority);
        if (newText && newTime && newPriority) {
            todo.text = newText.trim();
            todo.time = newTime.trim();
            todo.priority = newPriority.trim();
            todos.sort((a, b) => a.time.localeCompare(b.time));
            updateTodayStats();
            saveDataInLocalStorage();
            renderTodos();
            renderChart();
            scheduleTaskNotifications();
        }
    }
}

function unmarkAll() {
    todos.forEach(todo => todo.completed = false);
    updateTodayStats();
    saveDataInLocalStorage();
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
    if (progressText) progressText.textContent = `${percentage}%`;
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
        taskContent.textContent = `${todo.text} - ${todo.time} [${todo.priority}]`;
        if (todo.completed) taskContent.classList.add('completed');

        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onclick="toggleTodo(${todo.id})" />
        `;
        li.appendChild(taskContent);
        li.innerHTML += `
            <button onclick="editTodo(${todo.id})">✏️</button>
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

    const today = new Date();
    const labels = [];
    const completedData = [];
    const totalData = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        const dateStr = date.toDateString();
        const stats = dailyStats[dateStr] || { completed: 0, total: 0 };
        labels.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }));
        completedData.push(stats.completed);
        totalData.push(stats.total);
    }

    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tarefas Concluídas',
                    data: completedData,
                    backgroundColor: '#3498db',
                    borderWidth: 1,
                    borderRadius: 5
                },
                {
                    label: 'Total de Tarefas (Tendência)',
                    data: totalData,
                    type: 'line',
                    borderColor: '#e74c3c',
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            plugins: { legend: { display: true } }
        }
    });
}

function scheduleTaskNotifications() {
    const now = new Date();
    todos.forEach(todo => {
        const [hours, minutes] = todo.time.split(':').map(Number);
        const taskDate = new Date(now);
        taskDate.setHours(hours, minutes, 0, 0);

        const timeUntilNotification = taskDate - now - (5 * 60 * 1000); // 5 minutos antes
        if (timeUntilNotification > 0 && !todo.completed) {
            setTimeout(() => {
                if (!todo.completed) {
                    alert(`Lembrete: "${todo.text}" em 5 minutos! (${todo.time})`);
                }
            }, timeUntilNotification);
        }
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function loadDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

function showTaskStats() {
    let maxTotalDay = null;
    let maxTotal = -1;
    let maxCompletedDay = null;
    let maxCompleted = -1;

    for (const [dateStr, stats] of Object.entries(dailyStats)) {
        if (stats.total > maxTotal) {
            maxTotal = stats.total;
            maxTotalDay = dateStr;
        }
        if (stats.completed > maxCompleted) {
            maxCompleted = stats.completed;
            maxCompletedDay = dateStr;
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const message = `
        Dia com mais tarefas: ${maxTotalDay ? formatDate(maxTotalDay) : 'Nenhum dado'} (${maxTotal} tarefas)\n
        Dia em que mais concluiu tarefas: ${maxCompletedDay ? formatDate(maxCompletedDay) : 'Nenhum dado'} (${maxCompleted} tarefas concluídas)
    `;
    console.log(message);
    alert(message);
}

window.onload = function() {
    try {
        loadDataFromLocalStorage();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
};