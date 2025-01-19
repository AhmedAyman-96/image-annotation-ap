import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/firebase-admin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File or user ID not provided" },
        { status: 400 }
      );
    }

    // Upload the file to Vercel Blob
    const blob = await put(`uploads/${userId}/${file.name}`, file, {
      access: "public",
    });

    // Get the file URL
    const fileURL = blob.url;

    const taskRef = db.collection("tasks").doc();
    await taskRef.set({
      id: taskRef.id,
      imageURL: fileURL,
      assignedTo: userId,
      status: "Pending",
      annotations: [],
      createdAt: new Date(),
    });

    const userRef = db.collection("users").doc(userId) as any;
    await userRef.update({
      tasks: [...(userRef.tasks || []), taskRef.id],
    });

    return NextResponse.json({ fileURL, taskId: taskRef.id }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
