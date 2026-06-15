import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMemory } from "../hook/useMemory";
import "../styles/memory.css";

const MemoryDashboard = () => {
  const navigate = useNavigate();
  const { fetchMemories, addMemory, editMemory, removeMemory, clearAll } = useMemory();
  const { memories, loading, error } = useSelector((state) => state.memory);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);

  // New Memory state
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCategory, setNewCategory] = useState("profile");
  const [newImportance, setNewImportance] = useState(5);
  const [actionError, setActionError] = useState("");

  // Edit states mapping memory ID to true/false
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImportance, setEditImportance] = useState(5);

  useEffect(() => {
    fetchMemories().catch(() => {});
  }, [fetchMemories]);

  // Categories list
  const categories = ["all", "profile", "career", "tech_stack", "interests", "preferences"];

  // Filtered & searched memories
  const filteredMemories = useMemo(() => {
    return memories.filter((memory) => {
      const matchesCategory =
        selectedCategory === "all" || memory.category === selectedCategory;
      const matchesSearch =
        memory.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [memories, selectedCategory, searchQuery]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActionError("");

    if (!newKey.trim() || !newValue.trim() || !newCategory) {
      setActionError("All fields are required to add a memory.");
      return;
    }

    try {
      await addMemory({
        key: newKey.trim().toLowerCase().replace(/\s+/g, "_"),
        value: newValue.trim(),
        category: newCategory,
        importance: Number(newImportance),
      });
      // Reset form
      setNewKey("");
      setNewValue("");
      setNewCategory("profile");
      setNewImportance(5);
      setShowAddForm(false);
    } catch (err) {
      setActionError(err.message || "Failed to add memory.");
    }
  };

  const handleStartEdit = (memory) => {
    setEditingId(memory._id);
    setEditValue(memory.value);
    setEditCategory(memory.category);
    setEditImportance(memory.importance);
  };

  const handleSaveEdit = async (id, key) => {
    setActionError("");
    if (!editValue.trim() || !editCategory) {
      setActionError("Value and category are required.");
      return;
    }

    try {
      await editMemory(id, {
        value: editValue.trim(),
        category: editCategory,
        importance: Number(editImportance),
      });
      setEditingId(null);
    } catch (err) {
      setActionError(err.message || "Failed to update memory.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this memory item?")) {
      try {
        await removeMemory(id);
      } catch (err) {
        setActionError(err.message || "Failed to delete memory.");
      }
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        "WARNING: This will permanently delete all your stored memories. Are you sure you want to proceed?"
      )
    ) {
      try {
        await clearAll();
      } catch (err) {
        setActionError(err.message || "Failed to clear all memories.");
      }
    }
  };

  const formatKeyLabel = (keyStr) => {
    return keyStr.replace(/_/g, " ");
  };

  return (
    <div className="memory-dashboard-container">
      <header className="memory-header">
        <div className="memory-title-section">
          <button className="back-link" onClick={() => navigate("/dashboard")}>
            <span>←</span> Back to Chat
          </button>
          <h1>AI Memory System</h1>
        </div>
        <div className="memory-actions">
          <button
            className="btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel Adding" : "+ Add Memory"}
          </button>
          {memories.length > 0 && (
            <button className="btn-danger-outline" onClick={handleClearAll}>
              Forget All Memories
            </button>
          )}
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}
      {actionError && <div className="error-message">{actionError}</div>}

      {/* Add Memory Form Card */}
      {showAddForm && (
        <div className="memory-card" style={{ marginBottom: "30px", maxWidth: "600px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: "700" }}>
            Create New Memory
          </h3>
          <form className="memory-form" onSubmit={handleAddSubmit}>
            <div className="form-group">
              <label>Memory Key (e.g., profession, name, skills)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. preferred_tech_stack"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Memory Value</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. React, Node.js, Solidity"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                className="form-control"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="profile">Profile (Name, info, etc.)</option>
                <option value="career">Career (Goals, profession, skills)</option>
                <option value="tech_stack">Tech Stack (Preferences)</option>
                <option value="interests">Interests (Projects, learning topics)</option>
                <option value="preferences">Preferences (Communication style)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Importance Score (1 - 10): {newImportance}</label>
              <input
                type="range"
                min="1"
                max="10"
                className="form-control"
                style={{ padding: 0 }}
                value={newImportance}
                onChange={(e) => setNewImportance(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-save">
                Save Memory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Section */}
      <section className="memory-filter-bar" aria-label="Filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by key, value, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All Categories" : cat.replace(/_/g, " ").toUpperCase()}
            </option>
          ))}
        </select>
      </section>

      {/* Memories Grid */}
      {loading && memories.length === 0 ? (
        <div className="loading-container">Loading memories...</div>
      ) : (
        <main className="memories-grid" aria-label="Stored memories list">
          {filteredMemories.length === 0 ? (
            <div className="empty-memories">
              <h3>No Memories Found</h3>
              <p>
                The AI automatically extracts details during chat sessions, or you can add items manually above.
              </p>
            </div>
          ) : (
            filteredMemories.map((memory) => {
              const isEditing = editingId === memory._id;

              return (
                <article className="memory-card" key={memory._id}>
                  {isEditing ? (
                    <div className="memory-form">
                      <h4 style={{ margin: "0", color: "var(--text-color)", textTransform: "capitalize" }}>
                        Editing: {formatKeyLabel(memory.key)}
                      </h4>
                      <div className="form-group">
                        <label>Value</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          className="form-control"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                        >
                          <option value="profile">Profile</option>
                          <option value="career">Career</option>
                          <option value="tech_stack">Tech Stack</option>
                          <option value="interests">Interests</option>
                          <option value="preferences">Preferences</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Importance: {editImportance}</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          className="form-control"
                          style={{ padding: 0 }}
                          value={editImportance}
                          onChange={(e) => setEditImportance(e.target.value)}
                        />
                      </div>
                      <div className="form-actions">
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-save"
                          onClick={() => handleSaveEdit(memory._id, memory.key)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <header className="card-header">
                        <span className={`category-badge badge-${memory.category}`}>
                          {memory.category.replace(/_/g, " ")}
                        </span>
                        <span className="importance-score">
                          Importance: {memory.importance}/10
                        </span>
                      </header>

                      <h3 className="memory-key">{formatKeyLabel(memory.key)}</h3>
                      <p className="memory-value">{memory.value}</p>

                      <div className="importance-bar-container">
                        <div className="importance-bar-label">Strength</div>
                        <div className="importance-bar">
                          <div
                            className="importance-bar-fill"
                            style={{ width: `${memory.importance * 10}%` }}
                          />
                        </div>
                      </div>

                      <footer className="card-footer">
                        <span className="created-date">
                          Stored: {new Date(memory.createdAt).toLocaleDateString()}
                        </span>
                        <div className="card-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            title="Edit Memory"
                            onClick={() => handleStartEdit(memory)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-icon-delete"
                            title="Forget Memory"
                            onClick={() => handleDelete(memory._id)}
                          >
                            🗑
                          </button>
                        </div>
                      </footer>
                    </>
                  )}
                </article>
              );
            })
          )}
        </main>
      )}
    </div>
  );
};

export default MemoryDashboard;
