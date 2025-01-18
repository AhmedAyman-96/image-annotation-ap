"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import toast from "react-hot-toast";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);

      const response = await fetch("/api/user", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Logged out successfully!");
        router.push("/login");
      } else {
        toast.error("Failed to log out. Please try again.");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  if (loading) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Annotations App | Ahmed Ayman
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <p className="text-sm text-gray-600">{user.email}</p>

                <Link
                  href="/tasks"
                  className="text-gray-800 hover:text-blue-500"
                >
                  Tasks
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-800 hover:text-blue-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-800 hover:text-blue-500"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-gray-800 hover:text-blue-500"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
