import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://todo-backend-3gwg.onrender.com/todos";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    axios.get(API_URL).then((res) => setTodos(res.data));
  }, []);

  const addTodo = async () => {
    if (text.trim()) {
      const res = await axios.post(API_URL, { text, completed: false });
      setTodos([...todos, res.data]);
      setText("");
    }
  };

  const toggleTodo = async (id, completed) => {
    await axios.put(`${API_URL}/${id}`, { completed: !completed });
    setTodos(todos.map((todo) => (todo._id === id ? { ...todo, completed: !completed } : todo)));
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setTodos(todos.filter((todo) => todo._id !== id));
  };

  const startEdit = (id, text) => {
    setEditId(id);
    setEditText(text);
  };

  const updateTodo = async (id) => {
    if (editText.trim()) {
      await axios.put(`${API_URL}/${id}`, { text: editText });
      setTodos(todos.map((todo) => (todo._id === id ? { ...todo, text: editText } : todo)));
      setEditId(null);
      setEditText("");
    }
  };

  return (
    <div className="container">
      <h2>Todo List</h2>
      <div className="input-container">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a todo"
        />
        <button className="add-btn" onClick={addTodo}>Add</button>
      </div>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo._id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
            {editId === todo._id ? (
              <>
                <input
                  class
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="edit-input"
                />
                <button className="save-btn" onClick={() => updateTodo(todo._id)}>Save</button>
              </>
            ) : (
              <>
                <div>

                  <input
                    className="checkbox"
                    type="checkbox"
                    checked={todo.completed}
                    onClick={() => toggleTodo(todo._id, todo.completed)}

                  />

                  <span>{todo.text}</span>
                </div>
                <div className="action-btn" >

                  <button className="edit-btn" onClick={() => startEdit(todo._id, todo.text)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
