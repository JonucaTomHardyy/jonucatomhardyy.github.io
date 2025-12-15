const taskTableBody = document.querySelector('#taskTable tbody');
const addTaskBtn = document.getElementById('addTaskBtn');
let tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Stockage local

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskTableBody.innerHTML = '';
    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${index})"></td>
            <td>${task.name}</td>
            <td>${task.date}</td>
            <td>${formatDuration(task.duration)} 
                <button onclick="startTimer(${index})">Start</button>
                <button onclick="pauseTimer(${index})">Pause</button>
                <button onclick="stopTimer(${index})">Stop</button>
            </td>
            <td>
                <button onclick="toggleSubtasks(${index})">Sous-tâches</button>
                <button onclick="editNotes(${index})">Notes</button>
                <button onclick="deleteTask(${index})">Supprimer</button>
            </td>
        `;
        taskTableBody.appendChild(row);

        // Sous-tâches
        const subtasksRow = document.createElement('tr');
        subtasksRow.innerHTML = `<td colspan="5">
            <div class="subtasks" id="subtasks-${index}">
                ${task.subtasks.map((sub, subIndex) => `
                    <div><input type="checkbox" ${sub.completed ? 'checked' : ''} onchange="toggleSubComplete(${index}, ${subIndex})"> ${sub.name}</div>
                `).join('')}
                <button onclick="addSubtask(${index})">Ajouter sous-tâche</button>
            </div>
            <textarea id="notes-${index}" placeholder="Notes">${task.notes || ''}</textarea>
        </td>`;
        taskTableBody.appendChild(subtasksRow);

        // Notifications : Vérifie toutes les 60s si tâches non complètes
        setInterval(checkNotifications, 60000);
    });
}

function addTask() {
    const name = prompt('Nom de la tâche :');
    const date = prompt('Date (ex: aujourd\'hui, tous les jours) :');
    if (name && date) {
        tasks.push({ name, date, completed: false, subtasks: [], duration: 0, timer: null, startTime: 0, notes: '' });
        saveTasks();
        renderTasks();
    }
}

function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

function toggleSubComplete(taskIndex, subIndex) {
    tasks[taskIndex].subtasks[subIndex].completed = !tasks[taskIndex].subtasks[subIndex].completed;
    saveTasks();
    renderTasks();
}

function addSubtask(index) {
    const name = prompt('Nom de la sous-tâche :');
    if (name) {
        tasks[index].subtasks.push({ name, completed: false });
        saveTasks();
        renderTasks();
    }
}

function toggleSubtasks(index) {
    const subtasksDiv = document.getElementById(`subtasks-${index}`);
    subtasksDiv.classList.toggle('show');
}

function editNotes(index) {
    const notes = prompt('Notes pour cette tâche :', tasks[index].notes);
    if (notes !== null) {
        tasks[index].notes = notes;
        saveTasks();
        renderTasks();
    }
}

function startTimer(index) {
    if (!tasks[index].timer) {
        tasks[index].startTime = Date.now() - tasks[index].duration * 1000; // Reprendre si pause
        tasks[index].timer = setInterval(() => {
            tasks[index].duration = Math.floor((Date.now() - tasks[index].startTime) / 1000);
            saveTasks();
            renderTasks();
        }, 1000);
    }
}

function pauseTimer(index) {
    clearInterval(tasks[index].timer);
    tasks[index].timer = null;
}

function stopTimer(index) {
    pauseTimer(index);
    tasks[index].duration = 0;
    tasks[index].startTime = 0;
    saveTasks();
    renderTasks();
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function checkNotifications() {
    if (Notification.permission === 'granted') {
        tasks.forEach(task => {
            if (!task.completed && task.date === 'aujourd\'hui') { // Exemple pour aujourd'hui
                new Notification('Tâche en attente', { body: `La tâche "${task.name}" n'est pas encore faite !` });
            }
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

addTaskBtn.addEventListener('click', addTask);
renderTasks();