"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore, auth } from "@/firebase";
import { redirect, useRouter } from "next/navigation";
import ImageUpload from "@/app/_components/ImageUpload";
import Spinner from "@/app/_components/Spinner";
import { User } from "firebase/auth";
import { Task } from "../models/task";

export default function Tasks() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        redirect("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const tasksQuery = query(
          collection(firestore, "tasks"),
          where("assignedTo", "==", user.uid)
        );

        const unsubscribe = onSnapshot(
          tasksQuery,
          (tasksSnapshot) => {
            if (tasksSnapshot.empty) {
              setTasks([]);
              setFilteredTasks([]);
            } else {
              const tasksData = tasksSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as Task[];
              setTasks(tasksData);
              setFilteredTasks(tasksData);
            }
          },
          (error) => {
            setError("Failed to fetch tasks. Please try again.");
          }
        );

        return () => unsubscribe();
      } catch (error) {
        setError("Failed to fetch tasks. Please try again.");
      }
    };

    fetchTasks();
  }, [user]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((task) => task.status === statusFilter));
    }
  }, [statusFilter, tasks]);

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500">Not authenticated. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-[80%] p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Tasks</h1>

        <ImageUpload
          userId={user.uid}
          onUploadSuccess={() => setLoading(true)}
        />

        <div className="mb-6">
          <label
            htmlFor="statusFilter"
            className="block text-sm font-medium text-gray-700"
          >
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {filteredTasks.length === 0 ? (
          <p className="text-center text-gray-600">No tasks found.</p>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Task ID: {task.id}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Status:{" "}
                      <span
                        className={`font-semibold ${
                          task.status === "Pending"
                            ? "text-yellow-600"
                            : task.status === "In Progress"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      >
                        {task.status}
                      </span>
                    </p>
                  </div>
                  {task.imageURL && (
                    <img
                      src={task.imageURL}
                      alt="Task Image"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
