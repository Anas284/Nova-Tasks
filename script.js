class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDate();
        this.render();
        this.createParticles();
    }

    loadTodos() {
        try {
            const stored = localStorage.getItem('todos');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading todos:', error);
            return [];
        }
    }

    bindEvents() {
       
        const addBtn = document.getElementById('addBtn');
        const todoInput = document.getElementById('todoInput');

        if (addBtn && todoInput) {
            addBtn.addEventListener('click', () => this.addTodo());
            todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTodo();
            });
        }
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.currentTarget.dataset.filter);
            });
        });

        const clearBtn = document.getElementById('clearCompleted');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCompleted());
        }

        document.addEventListener('submit', (e) => e.preventDefault());
    }

    updateDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    createParticles() {
        const colors = ['#6366f1', '#8b5cf6', '#f472b6', '#06b6d4'];
        const container = document.querySelector('.background-animation');
        
        if (!container) return;

        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 6 + 2;
            const duration = Math.random() * 20 + 10;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                opacity: ${Math.random() * 0.3 + 0.1};
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: floatParticle ${duration}s infinite linear;
                pointer-events: none;
            `;
            
            container.appendChild(particle);
        }

        if (!document.getElementById('particle-animations')) {
            const style = document.createElement('style');
            style.id = 'particle-animations';
            style.textContent = `
                @keyframes floatParticle {
                    0% {
                        transform: translate(0, 0) rotate(0deg);
                        opacity: ${Math.random() * 0.3 + 0.1};
                    }
                    25% {
                        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(90deg);
                    }
                    50% {
                        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg);
                        opacity: ${Math.random() * 0.5 + 0.3};
                    }
                    75% {
                        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(270deg);
                    }
                    100% {
                        transform: translate(0, 0) rotate(360deg);
                        opacity: ${Math.random() * 0.3 + 0.1};
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        if (!input) return;

        const text = input.value.trim();

        if (text && text.length > 0) {
            const todo = {
                id: Date.now() + Math.random(), 
                text: text,
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'medium'
            };

            this.todos.unshift(todo);
            input.value = '';
            this.save();
            this.render();
            this.animateAdd();
            

            input.focus();
        } else {
            this.showNotification('Please enter a task', 'error');
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.save();
        this.render();
        this.animateDelete();
        this.showNotification('Task deleted', 'info');
    }

    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            const wasCompleted = todo.completed;
            todo.completed = !todo.completed;
            this.save();
            this.render();
            
            if (todo.completed && !wasCompleted) {
                this.celebrateCompletion();
                this.showNotification('Task completed! 🎉', 'success');
            }
        }
    }

    setFilter(filter) {
        if (['all', 'pending', 'completed'].includes(filter)) {
            this.currentFilter = filter;
            
         
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });

            this.render();
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        if (completedCount > 0) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.save();
            this.render();
            this.animateClear();
            this.showNotification(`Cleared ${completedCount} completed tasks`, 'info');
        } else {
            this.showNotification('No completed tasks to clear', 'warning');
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    updateStats() {
        const total = this.todos.length;
        const pending = this.todos.filter(todo => !todo.completed).length;
        const completed = this.todos.filter(todo => todo.completed).length;

        this.updateCounter('totalTasks', total);
        this.updateCounter('pendingTasks', pending);
        this.updateCounter('completedTasks', completed);
    }

    updateCounter(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            
            const current = parseInt(element.textContent) || 0;
            this.animateCounter(element, current, value, 500);
        }
    }

    animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(start + (end - start) * easeOutQuart);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = end;
            }
        };
        requestAnimationFrame(step);
    }

    save() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Error saving todos:', error);
            this.showNotification('Error saving tasks', 'error');
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const filteredTodos = this.getFilteredTodos();

        this.updateStats();

        if (!todoList || !emptyState) return;

        if (filteredTodos.length === 0) {
            emptyState.classList.remove('hidden');
            todoList.innerHTML = '';
            
            const title = emptyState.querySelector('h3');
            const message = emptyState.querySelector('p');
            
            if (title && message) {
                if (this.currentFilter === 'all') {
                    title.textContent = 'No tasks yet';
                    message.textContent = 'Add a task above to get started!';
                } else if (this.currentFilter === 'pending') {
                    title.textContent = 'No pending tasks';
                    message.textContent = 'All tasks are completed! 🎉';
                } else {
                    title.textContent = 'No completed tasks';
                    message.textContent = 'Complete some tasks to see them here';
                }
            }
        } else {
            emptyState.classList.add('hidden');
            
            todoList.innerHTML = filteredTodos.map(todo => `
                <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <div class="todo-actions">
                        <button class="delete-btn" aria-label="Delete task">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </li>
            `).join('');

            this.bindTodoEvents();
        }
    }

    bindTodoEvents() {
        const todoList = document.getElementById('todoList');
        if (!todoList) return;

        todoList.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const todoItem = e.target.closest('.todo-item');
                if (todoItem) {
                    const id = this.parseId(todoItem.dataset.id);
                    if (id) this.toggleTodo(id);
                }
            });
        });

        todoList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoItem = e.target.closest('.todo-item');
                if (todoItem) {
                    const id = this.parseId(todoItem.dataset.id);
                    if (id) this.deleteTodo(id);
                }
            });
        });

        // Double-click to edit (bonus feature)
        todoList.querySelectorAll('.todo-text').forEach(textElement => {
            textElement.addEventListener('dblclick', (e) => {
                this.enableEditMode(e.target);
            });
        });
    }

    enableEditMode(textElement) {
        const currentText = textElement.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'todo-edit-input';
        
        input.style.cssText = `
            width: 100%;
            padding: 8px;
            border: 2px solid var(--primary);
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1);
            color: var(--light);
            font-size: inherit;
            font-family: inherit;
        `;
        
        textElement.replaceWith(input);
        input.focus();
        input.select();
        
        const saveEdit = () => {
            const newText = input.value.trim();
            const todoItem = input.closest('.todo-item');
            
            if (newText && newText !== currentText) {
                const id = this.parseId(todoItem.dataset.id);
                const todo = this.todos.find(t => t.id === id);
                if (todo) {
                    todo.text = newText;
                    this.save();
                    this.render();
                    this.showNotification('Task updated', 'success');
                }
            } else {
                this.render(); 
            }
        };
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                this.render();
            }
        });
    }

    parseId(id) {
        const numId = Number(id);
        return isNaN(numId) ? null : numId;
    }

    animateAdd() {
        const todoItems = document.querySelectorAll('.todo-item');
        if (todoItems.length > 0) {
            todoItems[0].style.animation = 'slideIn 0.5s ease-out';
        }
    }

    animateDelete() {
        const stats = document.querySelectorAll('.stat-item');
        stats.forEach(stat => {
            stat.style.animation = 'none';
            setTimeout(() => {
                stat.style.animation = 'celebrate 0.3s ease-in-out';
            }, 10);
        });
    }

    animateClear() {
        const clearBtn = document.getElementById('clearCompleted');
        if (clearBtn) {
            clearBtn.style.animation = 'none';
            setTimeout(() => {
                clearBtn.style.animation = 'celebrate 0.5s ease-in-out';
            }, 10);
        }
    }

    celebrateCompletion() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#8b5cf6', '#f472b6', '#06b6d4']
            });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1'
        };
        return colors[type] || colors.info;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
        }
        
        .notification-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
    
    if (document.getElementById('todoList') && document.getElementById('addBtn')) {
        new TodoApp();
    } else {
        console.error('Required DOM elements not found');
    }
});

if (typeof confetti === 'undefined') {
    console.warn('Confetti library not loaded');
    window.confetti = function() {}; 
}