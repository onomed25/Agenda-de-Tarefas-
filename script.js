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
        if ('Notification' in window && Notification.permission === 'granted' && navigator.onLine) {
          new Notification(`Reminder: Task in 1 minute - ${todo.text} at ${todo.time}`);
        } else {
          console.log(`Reminder (offline): Task in 1 minute - ${todo.text} at ${todo.time}`);
          alert(`Reminder: Task in 1 minute - ${todo.text} at ${todo.time}`);
        }
        todo.notified = true;
        saveData();
      }
    });
  }
setInterval(checkNotifications, 60000);

function showAddModal() {
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('taskText').focus();
}

function showEditModal(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    document.getElementById('editText').value = todo.text;
    document.getElementById('editTime').value = todo.time;
    document.getElementById('editPriority').value = todo.priority;
    document.getElementById('editModal').dataset.id = id;
    document.getElementById('editModal').style.display = 'flex';
    document.getElementById('editText').focus();
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function addTodo(event) {
    event.preventDefault();
    const text = document.getElementById('taskText').value;
    const time = document.getElementById('taskTime').value;
    const priority = document.getElementById('taskPriority').value;

    if (!text || !time) return;

    todos.push({
        id: Date.now(),
        text,
        time,
        priority,
        completed: false,
        notified: false
    });
    updateTodayStats();
    saveData();
    renderTodos();
    hideModal('addModal');
    document.getElementById('addForm').reset();
}

function editTodo(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('editModal').dataset.id);
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    todo.text = document.getElementById('editText').value;
    todo.time = document.getElementById('editTime').value;
    todo.priority = document.getElementById('editPriority').value;
    todo.notified = false;
    saveData();
    renderTodos();
    hideModal('editModal');
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
    return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function renderTodos() {
    const list = document.getElementById('todo-list');
    if (!list) return;
    list.innerHTML = ''; // Limpa a lista

    const percentage = getCompletionPercentage();
    const percentageElement = document.getElementById('completion-percentage');
    if (percentageElement) percentageElement.textContent = `${percentage}`;

    todos.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = todo.completed ? 'completed' : '';

        // Container interno
        const divContent = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = todo.id;
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = `${todo.text} - ${todo.time} [${todo.priority}]`;

        divContent.appendChild(checkbox);
        divContent.appendChild(taskText);

        // Botões
        const divButtons = document.createElement('div');
        const editButton = document.createElement('button');
        editButton.className = 'edit';
        editButton.textContent = '✏️';
        editButton.addEventListener('click', () => showEditModal(todo.id));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.textContent = '🗑️';
        deleteButton.addEventListener('click', () => deleteTodo(todo.id));

        divButtons.appendChild(editButton);
        divButtons.appendChild(deleteButton);

        li.appendChild(divContent);
        li.appendChild(divButtons);
        list.appendChild(li);
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    migrateFromCookies();
    cleanUncompletedTasks();
    renderTodos();

    if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }

    document.getElementById('addForm').addEventListener('submit', addTodo);
    document.getElementById('editForm').addEventListener('submit', editTodo);
});