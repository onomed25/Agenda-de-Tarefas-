// Migração de Cookies para localStorage
function migrateFromCookies() {
    const hasCookies = document.cookie.length > 0;
    if (hasCookies && !localStorage.getItem('todos')) {
        const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
            const [key, value] = cookie.split('=');
            acc[key] = value;
            return acc;
        }, {});

        if (cookies['todos']) {
            localStorage.setItem('todos', decodeURIComponent(cookies['todos']));
            document.cookie = 'todos=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        }
        if (cookies['daily_stats']) {
            localStorage.setItem('daily_stats', decodeURIComponent(cookies['daily_stats']));
            document.cookie = 'daily_stats=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        }
        if (cookies['last_date']) {
            localStorage.setItem('last_date', decodeURIComponent(cookies['last_date']));
            document.cookie = 'last_date=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        }
        console.log('Dados migrados de cookies para localStorage');
    }
}

// Carregar dados do localStorage
let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let dailyStats = JSON.parse(localStorage.getItem('daily_stats') || '{}');
let lastDate = localStorage.getItem('last_date') || '';

function saveData() {
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('daily_stats', JSON.stringify(dailyStats));
    localStorage.setItem('last_date', lastDate);
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return isNaN(hours) || isNaN(minutes) ? -1 : hours * 60 + minutes;
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function cleanUncompletedTasks() {
    const today = getToday();
    if (lastDate !== today) {
        todos.forEach(todo => {
            if (todo.completed) {
                todo.completed = false;
                todo.notified = false;
            }
        });
        lastDate = today;
        updateTodayStats();
        saveData();
    }
}

function checkNotifications() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    todos.forEach(todo => {
        if (todo.notified) return;
        const taskMinutes = timeToMinutes(todo.time);
        if (taskMinutes === -1) return;

        if (currentMinutes === taskMinutes - 1) {
            alert(`Reminder: Task in 1 minute - ${todo.text} at ${todo.time}`);
            todo.notified = true;
            saveData();
        }
    });
}

setInterval(checkNotifications, 10000);

function addTodo() {
    const text = prompt('Task description:');
    if (!text) return;

    const now = new Date();
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const time = prompt(`Time (default ${defaultTime}):`, defaultTime) || defaultTime;

    const priority = prompt('Priority (low, medium, high):', 'low') || 'low';
    todos.push({
        id: todos.length + 1,
        text,
        time,
        priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'low',
        completed: false,
        notified: false
    });
    updateTodayStats();
    saveData();
    renderTodos();
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const text = prompt('Edit task description:', todo.text) || todo.text;
    const time = prompt('Edit time:', todo.time) || todo.time;
    const priority = prompt('Edit priority (low, medium, high):', todo.priority) || todo.priority;

    todo.text = text;
    todo.time = time;
    todo.priority = ['low', 'medium', 'high'].includes(priority) ? priority : 'low';
    todo.notified = false;
    saveData();
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    updateTodayStats();
    saveData();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        updateTodayStats();
        saveData();
        renderTodos();
    }
}

function updateTodayStats() {
    const today = getToday();
    dailyStats[today] = {
        completed: todos.filter(t => t.completed).length,
        total: todos.length
    };
    saveData();
}

function getCompletionPercentage() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    return total > 0 ? (completed / total * 100).toFixed(1) : 0;
}

function renderTodos() {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';
    const percentage = getCompletionPercentage();
    document.getElementById('completion-percentage').textContent = `${percentage}%`;

    // Ordenar tarefas pelo horário
    todos.sort((a, b) => {
        const timeA = timeToMinutes(a.time);
        const timeB = timeToMinutes(b.time);
        return timeA - timeB;
    });

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = todo.completed ? 'completed' : '';
        li.innerHTML = `
            <div>
                <input type="checkbox" value="${todo.id}" ${todo.completed ? 'checked' : ''} 
                       onchange="toggleTodo(${todo.id})">
                <span class="task-text">${todo.text} - ${todo.time} [${todo.priority}]</span>
            </div>
            <div>
                <button class="edit" onclick="editTodo(${todo.id})">✏️</button>
                <button class="delete" onclick="deleteTodo(${todo.id})">🗑️</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// Inicialização
migrateFromCookies();
cleanUncompletedTasks();
renderTodos();