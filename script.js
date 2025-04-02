let todos = [];
let dailyStats = { today: 0, yesterday: 0 }; // Armazena as tarefas concluídas por dia

// Função para carregar tarefas e estatísticas do cookie
function loadTodosFromCookies() {
  const todosCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('todos='));
  if (todosCookie) {
    const todosJson = decodeURIComponent(todosCookie.split('=')[1]);
    todos = JSON.parse(todosJson);
  }

  const statsCookie = document.cookie.split('; ').find(cookie => cookie.startsWith('dailyStats='));
  if (statsCookie) {
    const statsJson = decodeURIComponent(statsCookie.split('=')[1]);
    dailyStats = JSON.parse(statsJson);
  }

  checkDayChange(); // Verifica se o dia mudou
  renderTodos();
  renderChart();
}

// Função para salvar tarefas e estatísticas no cookie
function saveTodosInCookies() {
  const todosJson = JSON.stringify(todos);
  document.cookie = `todos=${encodeURIComponent(todosJson)}; path=/; max-age=31536000`;

  const statsJson = JSON.stringify(dailyStats);
  document.cookie = `dailyStats=${encodeURIComponent(statsJson)}; path=/; max-age=31536000`;
}

// Função para verificar se o dia mudou e atualizar as estatísticas
function checkDayChange() {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem('lastDate') || today;

  if (lastDate !== today) {
    dailyStats.yesterday = dailyStats.today;
    dailyStats.today = todos.filter(todo => todo.completed).length;
    localStorage.setItem('lastDate', today);
    saveTodosInCookies();
  }
}

// Função para adicionar tarefa
function addTodo() {
  const input = document.getElementById('new-todo');
  const newTodoText = input.value.trim();

  if (newTodoText) {
    const newTodo = {
      id: Date.now(),
      text: newTodoText,
      completed: false,
    };
    todos.push(newTodo);
    input.value = '';
    saveTodosInCookies();
    renderTodos();
  }
}

// Função para alternar o estado de completado
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  todo.completed = !todo.completed;
  dailyStats.today = todos.filter(t => t.completed).length; // Atualiza as tarefas concluídas hoje
  saveTodosInCookies();
  renderTodos();
  renderChart();
}

// Função para excluir tarefa
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  dailyStats.today = todos.filter(t => t.completed).length; // Atualiza as tarefas concluídas hoje
  saveTodosInCookies();
  renderTodos();
  renderChart();
}

// Função para desmarcar todas as tarefas
function unmarkAll() {
  todos.forEach(todo => todo.completed = false);
  dailyStats.today = 0; // Reseta as tarefas concluídas hoje
  saveTodosInCookies();
  renderTodos();
  renderChart();
}

// Função para calcular e atualizar o progresso
function updateProgress() {
  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  const percentage = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const progressCircle = document.querySelector('.progress-ring .progress-circle');
  const strokeDashoffset = 226.195 - (percentage / 100) * 226.195;
  progressCircle.style.strokeDashoffset = strokeDashoffset;

  document.getElementById('progress-text').textContent = `${percentage}%`;
}

// Função para renderizar a lista de tarefas
function renderTodos() {
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = todo.completed ? 'completed' : '';

    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? 'checked' : ''} onclick="toggleTodo(${todo.id})" />
      <span>${todo.text}</span>
      <button onclick="deleteTodo(${todo.id})">🗑️</button>
    `;
    
    taskList.appendChild(li);
  });

  updateProgress();
}

// Função para renderizar o gráfico
function renderChart() {
  const ctx = document.getElementById('dailyTasksChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Ontem', 'Hoje'],
      datasets: [{
        label: 'Tarefas Concluídas',
        data: [dailyStats.yesterday, dailyStats.today],
        backgroundColor: ['#3498db', '#2ecc71'],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1 // Apenas valores inteiros
          }
        }
      },
      responsive: true,
      plugins: {
        legend: {
          display: false // Esconde a legenda, já que é autoexplicativo
        }
      }
    }
  });
}

// Carregar tarefas e gráfico ao carregar a página
window.onload = function() {
  loadTodosFromCookies();
  renderChart();
};