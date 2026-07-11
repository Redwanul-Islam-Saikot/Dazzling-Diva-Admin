import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BottomBanner from "@/models/BottomBanner";

// ১. GET: ডাটাবেজ থেকে বটম ব্যানার ডাটা নিয়ে আসা
export async function GET() {
  try {
    await connectDB();
    const banner = await BottomBanner.findOne(); // যেহেতু একটাই ব্যানার, তাই findOne()
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Fetch failed" }, { status: 500 });
  }
}

// ২. POST: ব্যানার ডাটা তৈরি বা আপডেট করা (Upsert)
export async function POST(request: Request) {
  try {
    await connectDB();
    const { title, subtitle, linkUrl, imageUrl } = await request.json();

    if (!title || !linkUrl || !imageUrl) {
      return NextResponse.json({ success: false, message: "Required fields missing" }, { status: 400 });
    }

    // ডাটাবেজে কোনো ব্যানার আগে থেকে থাকলে সেটাকেই আপডেট করবে, না থাকলে নতুন একটা তৈরি করবে
    const banner = await BottomBanner.findOneAndUpdate(
      {}, // খালি অবজেক্ট মানে প্রথম যেটাই পাবে সেটাকেই টার্গেট করবে
      { title, subtitle, linkUrl, imageUrl },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, message: "Bottom Wide Banner successfully saved!", data: banner });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Operation failed" }, { status: 500 });
  }
}