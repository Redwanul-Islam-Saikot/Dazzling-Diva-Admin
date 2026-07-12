import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // টেস্টিংয়ের জন্য: ইমেইল এবং পাসওয়ার্ড ফাঁকা না থাকলেই লগইন সফল হবে
    if (email && password) {
      return NextResponse.json({ 
        success: true, 
        message: "Login successful (Bypassed for testing)",
        user: { email: email }
      }, { status: 200 });
    }

    return NextResponse.json(
      { success: false, message: "Please provide both email and password" },
      { status: 400 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}