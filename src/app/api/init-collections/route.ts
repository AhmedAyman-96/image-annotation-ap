import { db } from "@/firebase-admin";
import { NextResponse } from "next/server";

// This api is a mock and just for testing the firestore
export async function GET() {
  try {
    const userRef = db.collection("users").doc("user1");
    await userRef.set({
      userId: "user1",
      email: "user1@example.com",
      tasks: ["task1"],
    });

    const taskRef = db.collection("tasks").doc("task1");
    await taskRef.set({
      taskId: "task1",
      imageURL: "https://example.com/image1.jpg",
      assignedTo: "user1",
      annotations: [],
      status: "Pending",
    });

    return NextResponse.json({
      message: "Collections initialized successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initialize collections" },
      { status: 500 }
    );
  }
}
