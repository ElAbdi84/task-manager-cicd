import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = '/api';

function App() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch tasks from API
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/tasks`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTask,
                    description: newDescription,
                    completed: false
                })
            });

            if (!response.ok) throw new Error('Failed to add task');

            setNewTask('');
            setNewDescription('');
            fetchTasks();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = async (id, completed) => {
        try {
            const task = tasks.find(t => t.id === id);
            const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...task,
                    completed: !completed
                })
            });

            if (!response.ok) throw new Error('Failed to update task');
            fetchTasks();
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete task');
            fetchTasks();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="App">
            <div className="container">
                <header className="header">
                    <h1>📝 Task Manager</h1>
                    <p className="subtitle">AWS CI/CD Project - Full Stack Application</p>
                </header>

                {error && (
                    <div className="error-banner">
                        <strong>Error:</strong> {error}
                        <button onClick={() => setError(null)}>×</button>
                    </div>
                )}

                <div className="card">
                    <h2>Add New Task</h2>
                    <form onSubmit={addTask} className="task-form">
                        <input
                            type="text"
                            placeholder="Task title"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            className="input"
                            disabled={loading}
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className="textarea"
                            disabled={loading}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : '+ Add Task'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Tasks ({tasks.length})</h2>
                        <button onClick={fetchTasks} className="btn btn-secondary" disabled={loading}>
                            🔄 Refresh
                        </button>
                    </div>

                    {loading && tasks.length === 0 ? (
                        <div className="loading">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                        <div className="empty-state">
                            <p>No tasks yet. Add your first task above!</p>
                        </div>
                    ) : (
                        <ul className="task-list">
                            {tasks.map((task) => (
                                <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                    <div className="task-content">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => toggleTask(task.id, task.completed)}
                                            className="checkbox"
                                        />
                                        <div className="task-details">
                                            <h3 className="task-title">{task.title}</h3>
                                            {task.description && (
                                                <p className="task-description">{task.description}</p>
                                            )}
                                            <span className="task-date">
                                                Created: {new Date(task.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="btn btn-danger"
                                    >
                                        🗑️
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <footer className="footer">
                    <p>Deployed on AWS EC2 | Managed by CloudFormation | CI/CD with GitHub Actions</p>
                </footer>
            </div>
        </div>
    );
}

export default App;