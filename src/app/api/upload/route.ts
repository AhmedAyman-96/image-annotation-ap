import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getFirestore } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
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

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and GIF images are allowed" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, sanitizedFileName);
    fs.writeFileSync(filePath, buffer);

    const fileURL = `/uploads/${sanitizedFileName}`;

    const db = getFirestore();
    const taskRef = db.collection("tasks").doc();
    await taskRef.set({
      id: taskRef.id,
      imageURL: fileURL,
      assignedTo: userId,
      status: "Pending",
      annotations: [],
      createdAt: new Date(),
    });

    const userRef = db.collection("users").doc(userId);
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
