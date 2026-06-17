document.addEventListener('DOMContentLoaded', () => {
    // DOM Queries
    const todoForm = document.getElementById('todo-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskDatetimeInput = document.getElementById('task-datetime');
    const taskListContainer = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const submitBtn = document.getElementById('submit-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // App State Store
    let tasks = [];
    let editTaskId = null;
    let currentFilter = 'all';

    // Handler: Form Submission pipeline
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleText = taskTitleInput.value.trim();
        const dateTimeVal = taskDatetimeInput.value;

        if (!titleText || !dateTimeVal) return;

        if (editTaskId !== null) {
            // Update mutation branch
            tasks = tasks.map(task => {
                if (task.id === editTaskId) {
                    return { ...task, title: titleText, datetime: dateTimeVal };
                }
                return task;
            });
            editTaskId = null;
            submitBtn.textContent = 'Add Task';
            submitBtn.style.background = ''; // reset to default CSS
        } else {
            // Create entity branch
            const newTask = {
                id: Date.now().toString(),
                title: titleText,
                datetime: dateTimeVal,
                completed: false
            };
            tasks.push(newTask);
        }

        todoForm.reset();
        renderEngine();
    });

    // Global scoping hooks for dynamic inline markup interactions
    window.toggleTaskStatus = (id) => {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        renderEngine();
    };

    window.initiateEditMode = (id) => {
        const targetTask = tasks.find(task => task.id === id);
        if (!targetTask) return;

        taskTitleInput.value = targetTask.title;
        taskDatetimeInput.value = targetTask.datetime;

        editTaskId = id;
        submitBtn.textContent = 'Update';
        submitBtn.style.background = '#ff4b5c'; // Highlight submission area during explicit modification
        taskTitleInput.focus();
    };

    window.removeTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        renderEngine();
    };

    // Filter event binding UI loops
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderEngine();
        });
    });

    // Formatting date wrapper standard
    function humanizeDate(rawDateTimeStr) {
        const dateObj = new Date(rawDateTimeStr);
        return dateObj.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Dynamic Render Engine Layout Compiler
    function renderEngine() {
        taskListContainer.innerHTML = '';

        // Filter Evaluation Logic
        let filteredTasks = tasks;
        if (currentFilter === 'pending') {
            filteredTasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(t => t.completed);
        }

        // Toggle Visibility Fallbacks
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }

        // Chronological sort processing (Ascending by scheduled time)
        filteredTasks.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

        // Inject computed nodes dynamically 
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed-state' : ''}`;

            li.innerHTML = `
                <div class="task-info-pane">
                    <span class="task-title-text">${task.title}</span>
                    <span class="task-datetime-text">⏰ ${humanizeDate(task.datetime)}</span>
                </div>
                <div class="action-cluster">
                    <button class="btn-icon complete-action" onclick="toggleTaskStatus('${task.id}')">
                        ${task.completed ? 'Undo' : 'Done'}
                    </button>
                    <button class="btn-icon edit-action" onclick="initiateEditMode('${task.id}')" ${task.completed ? 'disabled' : ''}>
                        Edit
                    </button>
                    <button class="btn-icon delete-action" onclick="removeTask('${task.id}')">
                        Remove
                    </button>
                </div>
            `;
            taskListContainer.appendChild(li);
        });
    }
});