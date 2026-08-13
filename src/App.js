import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [task, setTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [season, setSeason] = useState(() => {
    return localStorage.getItem("season") || "spring";
  });
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");

    if (!savedTasks) {
      return [];
    }

    const savedArray = JSON.parse(savedTasks);

    return savedArray.map((item, index) => ({
      ...item,
      id: item.id || `${Date.now()}-${index}`,
      priority: item.priority || "medium",
      dueDate: item.dueDate || "",
    }));
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("season", season);
  }, [season]);
  function addTask() {
    if (task.trim() === "") {
      return;
    }

    const newTask = {
      id: Date.now(),
      text: task.trim(),
      completed: false,
      priority: priority,
      dueDate: dueDate,
    };

    setTasks([...tasks, newTask]);

    setTask("");
    setPriority("medium");
    setDueDate("");
  }

  function deleteTask(id) {
    const newTasks = tasks.filter((item) => item.id !== id);
    setTasks(newTasks);
  }

  function toggleTask(id) {
    const newTasks = tasks.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          completed: !item.completed,
        };
      }

      return item;
    });

    setTasks(newTasks);
  }

  function startEditing(item) {
    setEditingId(item.id);
    setEditingText(item.text);
  }

  function saveEdit(id) {
    if (editingText.trim() === "") {
      return;
    }

    const updatedTasks = tasks.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          text: editingText.trim(),
        };
      }

      return item;
    });

    setTasks(updatedTasks);
    setEditingId(null);
    setEditingText("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }

  const remainingTasks = tasks.filter((item) => !item.completed).length;

  const completedTasks = tasks.filter((item) => item.completed).length;

  const progress =
    tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  const filteredTasks = tasks.filter((item) => {
    const matchesSearch = item.text
      .toLowerCase()
      .includes(search.toLowerCase());

    if (!matchesSearch) {
      return false;
    }

    if (filter === "active") {
      return !item.completed;
    }

    if (filter === "completed") {
      return item.completed;
    }

    return true;
  });

  const priorityOrder = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    if (sortBy === "dueDate") {
      if (!a.dueDate && !b.dueDate) {
        return 0;
      }

      if (!a.dueDate) {
        return 1;
      }

      if (!b.dueDate) {
        return -1;
      }

      return a.dueDate.localeCompare(b.dueDate);
    }

    if (sortBy === "alphabetical") {
      return a.text.localeCompare(b.text);
    }

    return 0;
  });
  function clearCompleted() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all completed tasks?",
    );

    if (!confirmed) {
      return;
    }
    const activeTasks = tasks.filter((item) => !item.completed);
    setTasks(activeTasks);
    setEditingId(null);
    setEditingText("");
  }
  return (
    <main className={`app ${season}`}>
      <div className="container">
        <div className="top-bar">
          <h1>To-Do List</h1>

          <select
            className="season-select"
            value={season}
            onChange={(event) => setSeason(event.target.value)}
          >
            <option value="spring">🌸 Spring</option>
    <option value="summer">☀️ Summer</option>
    <option value="autumn">🍂 Autumn</option>
    <option value="winter">❄️ Winter</option>
          </select>
        </div>
        <div className="input-section">
          <input
            type="text"
            placeholder="Enter a new task"
            value={task}
            onChange={(event) => setTask(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                addTask();
              }
            }}
          />

          <select
            className="priority-select"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            className="date-input"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />

          <button className="add-button" onClick={addTask}>
            Add
          </button>
        </div>

        <div className="search-section">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              className="clear-search-button"
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}
        </div>

        <p className="task-counter">{remainingTasks} tasks remaining</p>

        <div className="progress-info">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="filters">
          <button
            className={filter === "all" ? "active-filter" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            className={filter === "active" ? "active-filter" : ""}
            onClick={() => setFilter("active")}
          >
            Active
          </button>

          <button
            className={filter === "completed" ? "active-filter" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>

        <div className="sort-section">
          <label htmlFor="sort">Sort by:</label>

          <select
            id="sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="default">Default</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>

        {completedTasks > 0 && (
          <button className="clear-completed-button" onClick={clearCompleted}>
            Clear Completed ({completedTasks})
          </button>
        )}
        <ul>
          {sortedTasks.map((item) => (
            <li key={item.id}>
              {editingId === item.id ? (
                <>
                  <input
                    className="edit-input"
                    type="text"
                    value={editingText}
                    onChange={(event) => setEditingText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        saveEdit(item.id);
                      }

                      if (event.key === "Escape") {
                        cancelEdit();
                      }
                    }}
                    autoFocus
                  />

                  <button
                    className="save-button"
                    onClick={() => saveEdit(item.id)}
                  >
                    Save
                  </button>

                  <button className="cancel-button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleTask(item.id)}
                  />

                  <span className={item.completed ? "completed" : ""}>
                    {item.text}
                  </span>

                  <span className={`priority-badge ${item.priority}`}>
                    {item.priority}
                  </span>

                  {item.dueDate && (
                    <span className="due-date">
                      {new Date(
                        `${item.dueDate}T00:00:00`,
                      ).toLocaleDateString()}
                    </span>
                  )}

                  <button
                    className="edit-button"
                    onClick={() => startEditing(item)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => deleteTask(item.id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default App;