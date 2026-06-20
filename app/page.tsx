"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
const Check = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);

const Trash2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const Plus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);

type Todo = {
  id: number;
  title: string;
  is_completed: boolean;
  created_at: string;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch todos. Did you set up Supabase?");
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { data, error } = await supabase
        .from("todos")
        .insert([{ title: newTask }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTodos([data, ...todos]);
        setNewTask("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to add todo");
    }
  };

  const toggleComplete = async (id: number, currentStatus: boolean) => {
    try {
      // Optimistic update
      setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));

      const { error } = await supabase
        .from("todos")
        .update({ is_completed: !currentStatus })
        .eq("id", id);

      if (error) {
        // Revert on error
        setTodos(todos.map(t => t.id === id ? { ...t, is_completed: currentStatus } : t));
        throw error;
      }
    } catch (err: any) {
      setError(err.message || "Failed to update todo");
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      // Optimistic update
      const previousTodos = [...todos];
      setTodos(todos.filter(t => t.id !== id));

      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id);

      if (error) {
        // Revert on error
        setTodos(previousTodos);
        throw error;
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete todo");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-16 px-4 font-sans selection:bg-indigo-500/30">
      <div className="max-w-xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Tasks
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            A minimal, polished to-do list powered by Supabase.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={addTodo} className="mb-8 relative">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 pr-16 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white rounded-xl transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-zinc-400 animate-pulse">
              Loading tasks...
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-16 bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 border-dashed">
              <p className="text-zinc-500 dark:text-zinc-400">No tasks yet. Add one above!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`group flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                  todo.is_completed
                    ? "border-transparent opacity-60"
                    : "border-zinc-100 dark:border-zinc-800"
                }`}
              >
                <button
                  onClick={() => toggleComplete(todo.id, todo.is_completed)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    todo.is_completed
                      ? "bg-indigo-500 border-indigo-500 text-white"
                      : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                
                <div className="flex-1 flex flex-col min-w-0">
                  <span
                    className={`text-base transition-all duration-200 ${
                      todo.is_completed
                        ? "text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-600"
                        : "text-zinc-700 dark:text-zinc-200"
                    }`}
                  >
                    {todo.title}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    {new Date(todo.created_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
