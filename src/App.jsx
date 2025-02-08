import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
const API_URL = "https://todo-backend-3gwg.onrender.com";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      axios
        .get(`${API_URL}/todos`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setTodos(res.data))
        .catch(() => {
          setToken(null);
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  const register = async () => {
    await axios.post(`${API_URL}/register`, { username, password });
    alert("User registered! Now login.");
  };

  const login = async () => {
    const res = await axios.post(`${API_URL}/login`, { username, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTodos([]);
    setUsername("");
    setPassword("");
  };

  const addTodo = async () => {
    if (text.trim()) {
      const res = await axios.post(
        `${API_URL}/todos`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos([...todos, res.data]);
      setText("");
    }
  };

  const toggleTodo = async (id, completed) => {
    await axios.put(
      `${API_URL}/todos/${id}`,
      { completed: !completed },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTodos(todos.map((todo) => (todo._id === id ? { ...todo, completed: !completed } : todo)));
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API_URL}/todos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setTodos(todos.filter((todo) => todo._id !== id));
  };

  const startEdit = (id, text) => {
    setEditId(id);
    setEditText(text);
  };

  const updateTodo = async (id) => {
    if (editText.trim()) {
      await axios.put(
        `${API_URL}/todos/${id}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.map((todo) => (todo._id === id ? { ...todo, text: editText } : todo)));
      setEditId(null);
      setEditText("");
    }
  };
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedTodos = [...todos];
    const [movedItem] = reorderedTodos.splice(result.source.index, 1);
    reorderedTodos.splice(result.destination.index, 0, movedItem);

    setTodos(reorderedTodos);

    try {
      await axios.put(
        "https://todo-backend-3gwg.onrender.com/todos/reorder",
        { updatedTodos: reorderedTodos },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };
  return (
    <div className="container">
      {!token ? (
        <div>
          <h2>Login / Register</h2>
          <div className="login-container">

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
            />
          </div>
          <div className="login-btn">

            <button onClick={register}>Register</button>
            <button onClick={login}>Login</button>
          </div>
        </div>
      ) : (
        <div>
          <button onClick={logout}>Logout</button>
          <h2>Todo List</h2>
          <div className="input-container">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a todo"
            />
            <button className="add-btn" onClick={addTodo}>
              Add
            </button>
          </div>


          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <ul
                  className="todo-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {todos.map((todo, index) => (
                    <Draggable key={todo._id} draggableId={todo._id} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`todo-item ${todo.completed ? "completed" : ""}`}
                        >
                          {editId === todo._id ? (
                            <>
                              <input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="edit-input"
                              />
                              <button
                                className="save-btn"
                                onClick={() => updateTodo(todo._id)}
                              >
                                Save
                              </button>
                            </>
                          ) : (
                            <>
                              <div>
                                <span {...provided.dragHandleProps} className="drag-icon">
                                  ☰
                                </span>
                                <input
                                  className="checkbox"
                                  type="checkbox"
                                  checked={todo.completed}
                                  onChange={() => toggleTodo(todo._id, todo.completed)}
                                />
                                <span>{todo.text}</span>
                              </div>
                              <div className="action-btn">
                                <button
                                  className="edit-btn"
                                  onClick={() => startEdit(todo._id, todo.text)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={() => deleteTodo(todo._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>

        </div>
      )}
    </div>
  );
};

export default App;
