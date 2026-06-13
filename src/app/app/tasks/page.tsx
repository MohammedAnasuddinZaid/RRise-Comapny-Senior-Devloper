"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { mockTasks as initialTasks } from "../../../data/mock/tasks";
import { CheckCircle2, Circle, Plus, Trash2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("12:00 PM");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      dueTime: newTaskTime,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="space-y-10 pb-12 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="font-playfair text-4xl font-bold tracking-tight">Today's Focus</h1>
        <p className="text-muted-foreground font-light">
          Organize your day, prioritize the essential, and clear your mind.
        </p>
      </div>

      {/* Task Creation Form */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8">
          <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What task needs your attention today?"
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-6 py-4 text-base placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors"
            />
            <div className="flex gap-4">
              <input
                type="text"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                placeholder="Due time"
                className="w-32 bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-center text-sm outline-none focus:border-primary/50 transition-colors"
              />
              <Button type="submit" className="rounded-xl h-full py-4 px-6">
                <Plus className="w-5 h-5 mr-2" /> Add Task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/5 pb-6">
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Tasks</span>
            <span className="text-sm font-sans font-normal text-muted-foreground">
              {tasks.filter((t) => t.completed).length} of {tasks.length} completed
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-6 hover:bg-white/[0.01] transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(task.id)}>
                    <button className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    <div className="space-y-1">
                      <p className={`font-medium text-base transition-all ${
                        task.completed ? "line-through text-muted-foreground/60" : "text-foreground"
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-light">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Today • {task.dueTime}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {tasks.length === 0 && (
              <div className="p-12 text-center text-muted-foreground font-light">
                All tasks are complete. Take a moment to breathe.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
