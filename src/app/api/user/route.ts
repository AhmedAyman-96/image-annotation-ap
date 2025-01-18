import { NextResponse, NextRequest } from "next/server";
import { dbAuth } from "@/firebase-admin";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth as clientAuth } from "@/firebase";

// Helper function to set cookies
const setAuthCookies = (
  response: NextResponse,
  idToken: string,
  refreshToken: string
) => {
  response.cookies.set("authToken", idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600, // 1 hour
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 604800, // 7 days
  });
};

// POST: Handle user login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const userCredential = await signInWithEmailAndPassword(
      clientAuth,
      email,
      password
    );

    const idToken = await userCredential.user.getIdToken();
    const refreshToken = userCredential.user.refreshToken;

    const response = NextResponse.json(
      {
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        },
      },
      { status: 200 }
    );

    setAuthCookies(response, idToken, refreshToken);

    return response;
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { error: "Failed to log in. Please check your credentials." },
      { status: 500 }
    );
  }
}

// GET: Fetch user info or refresh the token if expired
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("authToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!authToken || !refreshToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await dbAuth.verifyIdToken(authToken);
    } catch (error) {
      console.error("ID token verification failed:", error);

      if (error.code === "auth/id-token-expired") {
        if (!clientAuth.currentUser) {
          return NextResponse.json(
            { error: "User session expired. Please log in again." },
            { status: 401 }
          );
        }

        const newIdToken = await clientAuth.currentUser.getIdToken(true);

        const response = NextResponse.json(
          {
            user: {
              uid: clientAuth.currentUser.uid,
              email: clientAuth.currentUser.email,
            },
          },
          { status: 200 }
        );

        setAuthCookies(response, newIdToken, refreshToken);

        return response;
      } else {
        throw error;
      }
    }

    const user = await dbAuth.getUser(decodedToken.uid);

    return NextResponse.json(
      { user: { uid: user.uid, email: user.email } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user info" },
      { status: 500 }
    );
  }
}

// DELETE: Handle user logout
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.delete("authToken");
    response.cookies.delete("refreshToken");

    return response;
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
