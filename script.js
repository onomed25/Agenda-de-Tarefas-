let todos = [];

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
    renderTodos();
  }
}

// Função para alternar o estado de completado
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  todo.completed = !todo.completed;
  renderTodos();
}

// Função para excluir tarefa
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  renderTodos();
}

// Função para desmarcar todas as tarefas
function unmarkAll() {
  todos.forEach(todo => todo.completed = false);
  renderTodos();
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