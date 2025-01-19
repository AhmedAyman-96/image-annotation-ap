"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { firestore, auth } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import AnnotationCanvas from "@/app/_components/AnnotationCanvas";
import Spinner from "@/app/_components/Spinner";
import toast from "react-hot-toast";
import { User } from "firebase/auth";

interface Task {
  id: string;
  imageURL: string;
  status: string;
  assignedTo: string;
  createdAt: { seconds: number; nanoseconds: number };
  annotations?: { rectangle: any; annotation: string }[];
}

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
};

export default function TaskDetails() {
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchTaskAndList = async () => {
      try {
        setLoading(true);
        const taskRef = doc(firestore, "tasks", taskId);
        const taskDoc = await getDoc(taskRef);

        if (taskDoc.exists()) {
          const taskData = taskDoc.data() as Task;
          setTask({ ...taskData, id: taskDoc.id });
          setAnnotations(taskData.annotations || []);
        } else {
          setError("Task not found.");
        }

        const tasksQuery = query(
          collection(firestore, "tasks"),
          where("assignedTo", "==", user.uid)
        );
        const tasksSnapshot = await getDocs(tasksQuery);

        if (!tasksSnapshot.empty) {
          const tasksData = tasksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[];
          setTaskList(tasksData);

          const index = tasksData.findIndex((task) => task.id === taskId);
          setCurrentTaskIndex(index);
        }
      } catch (error) {
        setError("Failed to fetch task. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskAndList();
  }, [taskId, user]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!task) return;

    if (
      newStatus === "Completed" &&
      (!annotations || annotations.length === 0)
    ) {
      toast.error(
        "You must add at least one annotation before marking the task as Completed."
      );
      return;
    }

    try {
      const taskRef = doc(firestore, "tasks", task.id);
      await updateDoc(taskRef, { status: newStatus, annotations });
      setTask({ ...task, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update task status. Please try again.");
    }
  };

  const handleSaveAnnotations = async () => {
    if (!task) return;

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const taskRef = doc(firestore, "tasks", task.id);
      await updateDoc(taskRef, { annotations });
      setSaveSuccess(true);
      toast.success("Annotations saved successfully!");
    } catch (error) {
      toast.error("Failed to save annotations. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInvalidAction = () => {
    if (task?.status !== "In Progress") {
      toast.error(
        "You can only annotate when the task is in 'In Progress' state."
      );
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex < taskList.length - 1) {
      const nextTaskId = taskList[currentTaskIndex + 1].id;
      router.push(`/tasks/${nextTaskId}`);
    }
  };

  const handlePreviousTask = () => {
    if (currentTaskIndex > 0) {
      const previousTaskId = taskList[currentTaskIndex - 1].id;
      router.push(`/tasks/${previousTaskId}`);
    }
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

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Task not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-[80%] p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Task Details</h1>

        <button
          onClick={() => router.push("/tasks")}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Tasks
        </button>

        <div className="flex justify-between mb-6">
          <button
            onClick={handlePreviousTask}
            disabled={currentTaskIndex === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNextTask}
            disabled={currentTaskIndex === taskList.length - 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Task ID: {task.id}</h2>
            <p className="text-sm text-gray-600">
              Created At:{" "}
              {new Date(task.createdAt.seconds * 1000).toLocaleString()}
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status:
            </label>
            <div className="flex space-x-2">
              {Object.keys(statusColors).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={task.status === "Completed"}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    statusColors[status as keyof typeof statusColors]
                  } ${
                    task.status === status
                      ? "ring-2 ring-offset-2 ring-gray-500"
                      : ""
                  } ${
                    task.status === "Completed"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Annotations</h2>
            <AnnotationCanvas
              imageUrl={task.imageURL}
              annotations={annotations}
              setAnnotations={setAnnotations}
              readOnly={task.status !== "In Progress"}
              onInvalidAction={handleInvalidAction}
            />
          </div>

          {task.status === "In Progress" && (
            <div className="mt-6">
              <button
                onClick={handleSaveAnnotations}
                disabled={saving}
                className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <Spinner className="w-5 h-5 mr-2" /> Saving...
                  </div>
                ) : (
                  "Save Annotations"
                )}
              </button>
              {saveSuccess && (
                <p className="text-green-500 text-sm mt-2">
                  Annotations saved successfully!
                </p>
              )}
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
