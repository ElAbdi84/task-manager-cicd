import React, { useState, useEffect } from 'react';
import './App.css';

// Détecter l'environnement
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://52.3.229.166/api'  // En dev local, pointer vers EC2
  : '/api';  // En production, utiliser le proxy Nginx

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Impossible de charger les tâches. Vérifiez votre connexion.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          completed: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to create task');

      setFormData({ title: '', description: '' });
      fetchTasks();
      setError(null);
    } catch (err) {
      setError('Impossible de créer la tâche');
      console.error('Error creating task:', err);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          completed: !task.completed,
        }),
      });

      if (!response.ok) throw new Error('Failed to update task');
      fetchTasks();
    } catch (err) {
      setError('Impossible de mettre à jour la tâche');
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');
      fetchTasks();
    } catch (err) {
      setError('Impossible de supprimer la tâche');
      console.error('Error deleting task:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>⚡ Task Manager Pro</h1>
        <p>Gérez vos tâches avec style et efficacité</p>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="task-form">
        <h2>Nouvelle Tâche</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Entrez le titre de la tâche..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ajoutez des détails (optionnel)..."
            />
          </div>

          <button type="submit" className="btn btn-primary">
            ➕ Ajouter la tâche
          </button>
        </form>
      </div>

      <div className="tasks-section">
        {loading ? (
          <div className="loading">Chargement des tâches</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>Aucune tâche pour le moment</h3>
            <p>Créez votre première tâche pour commencer !</p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-item ${task.completed ? 'completed' : ''}`}
              >
                <div className="task-header">
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task)}
                  />
                  <h3>{task.title}</h3>
                </div>

                <div className="task-body">
                  {task.description && <p>{task.description}</p>}
                  <div className="task-meta">
                    <span>
                      {task.completed ? '✅ Terminée' : '⏳ En cours'}
                    </span>
                    {' • '}
                    <span>
                      {new Date(task.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="task-actions">
                  <button
                    onClick={() => toggleComplete(task)}
                    className="btn btn-secondary"
                  >
                    {task.completed ? '↩️ Réactiver' : '✓ Terminer'}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="btn btn-danger"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;