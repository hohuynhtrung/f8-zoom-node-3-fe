import { useEffect, useState } from "react";
import "./App.css";

const BASE_API = import.meta.env.VITE_BASE_API || "http://localhost:3000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Thêm state content
  const [error, setError] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState(""); // Thêm state editContent

  // [GET] Lấy danh sách tasks
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${BASE_API}/api/tasks`);
      const result = await res.json();

      if (result.status === "success") {
        setTasks(result.data);
        setError("");
      } else {
        setError(result.message || "Không thể tải danh sách");
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setError("Lỗi kết nối Server");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // [POST] Thêm task mới
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(`${BASE_API}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(), // Gửi thêm content
        }),
      });
      const result = await res.json();

      if (result.status === "success") {
        setTitle("");
        setContent(""); // Reset content
        fetchTasks();
      } else {
        setError(result.message || "Thêm task thất bại");
      }
    } catch (err) {
      console.error("Add Task Failed:", err);
      setError("Thêm task thất bại");
    }
  };

  // [PUT/PATCH] Toggle hoàn thành task
  const handleToggleTask = async (task) => {
    try {
      const res = await fetch(`${BASE_API}/api/tasks/${task.id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_completed: !task.is_completed,
        }),
      });
      const result = await res.json();

      if (result.status === "success") {
        fetchTasks();
      } else {
        setError(result.message || "Cập nhật task thất bại");
      }
    } catch (err) {
      console.error("Toggle Task Failed", err);
      setError("Cập nhật task thất bại");
    }
  };

  // [DELETE] Xóa Task
  const handleDeleteTask = async (id) => {
    const isConfirm = window.confirm("Bạn chắc muốn xóa task này không?");
    if (!isConfirm) return;

    try {
      const res = await fetch(`${BASE_API}/api/tasks/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (result.status === "success") {
        fetchTasks();
      } else {
        setError(result.message || "Xóa task thất bại");
      }
    } catch (err) {
      console.error("Error delete", err);
      setError("Xóa task thất bại");
    }
  };

  const handleEdit = (task) => {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditContent(task.content || "");
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditContent("");
  };

  // [PUT] Sửa Task
  const handleSaveEdit = async (task) => {
    const newTitle = editTitle.trim();
    const newContent = editContent.trim();

    if (!newTitle) {
      handleCancelEdit();
      return;
    }

    if (newTitle === task.title && newContent === task.content) {
      handleCancelEdit();
      return;
    }

    try {
      const res = await fetch(`${BASE_API}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          is_completed: task.is_completed,
        }),
      });
      const result = await res.json();

      if (result.status === "success") {
        handleCancelEdit();
        fetchTasks();
      } else {
        setError(result.message || "Cập nhật task thất bại");
      }
    } catch (err) {
      console.error("Edit task failed", err);
      setError("Cập nhật task thất bại");
    }
  };

  return (
    <div className="app-container">
      <div className="todo-card">
        <h1 className="todo-header">Todo List</h1>
        {error && <p className="error-text">{error}</p>}

        {/* Form thêm task với tiêu đề + mô tả */}
        <form className="todo-form" onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Tiêu đề công việc..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="todo-input"
          />
          <input
            type="text"
            placeholder="Mô tả công việc..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="todo-input todo-content-input"
          />
          <button type="submit" className="add-button">
            Thêm
          </button>
        </form>

        {/* Danh sách Tasks */}
        <ul className="task-list">
          {!Array.isArray(tasks) || tasks.length === 0 ? (
            <p className="empty-text">Chưa có công việc nào!</p>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="task-item">
                <div className="task-content">
                  <input
                    type="checkbox"
                    checked={Boolean(task.is_completed)}
                    onChange={() => handleToggleTask(task)}
                    className="task-checkbox"
                  />
                  {editId === task.id ? (
                    <div className="task-edit-box">
                      <input
                        type="text"
                        value={editTitle}
                        autoFocus
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="task-edit-input"
                        placeholder="Tiêu đề..."
                      />
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="task-edit-input"
                        placeholder="Mô tả..."
                      />
                      <div className="edit-actions">
                        <button
                          onClick={() => handleSaveEdit(task)}
                          className="save-button"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="cancel-button"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="task-text" onClick={() => handleEdit(task)}>
                      <span
                        className={`task-title ${task.is_completed ? "completed" : ""}`}
                      >
                        {task.title}
                      </span>
                      {task.content && (
                        <p
                          className={`task-description ${task.is_completed ? "completed" : ""}`}
                        >
                          {task.content}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="delete-button"
                >
                  Xóa
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
