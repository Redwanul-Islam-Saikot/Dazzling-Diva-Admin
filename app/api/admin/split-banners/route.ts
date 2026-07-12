import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SplitBanner from "@/models/SplitBanner";

// ১. GET: সব স্প্লিট ব্যানার নিয়ে আসা
export async function GET() {
  try {
    await connectDB();
    const banners = await SplitBanner.find().sort({ position: 1 }); // পজিশন অনুযায়ী সাজানো (১, ২)
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Fetch failed" },
      { status: 500 }
    );
  }
}

// ২. POST: নতুন ব্যানার বা পজিশন আপডেট/তৈরি করা (Upsert লজিক)
// Manager UI-তে Add আর Edit — দুটোই এই একটা POST route ব্যবহার করে,
// কারণ position-ই key: একই position আবার সেভ করলে সেটা update হয়ে যায়।
export async function POST(request: Request) {
  try {
    await connectDB();
    const { title, subtitle, linkUrl, imageUrl, position } = await request.json();

    if (!title || !linkUrl || !imageUrl || position === undefined) {
      return NextResponse.json(
        { success: false, message: "Required fields missing" },
        { status: 400 }
      );
    }

    // যদি এই পজিশনে আগে থেকেই কোনো ব্যানার থাকে, তবে সেটা আপডেট হবে, না থাকলে নতুন তৈরি হবে
    const banner = await SplitBanner.findOneAndUpdate(
      { position },
      { title, subtitle, linkUrl, imageUrl },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: `Banner at position ${position} updated!`,
      data: banner,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Operation failed" },
      { status: 500 }
    );
  }
}

// ৩. DELETE: একটা ব্যানার মুছে ফেলা
// Manager UI-এর Trash আইকন এটাকে কল করে: /api/admin/split-banners?id=xxxx
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID required" },
        { status: 400 }
      );
    }

    await SplitBanner.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: "Split banner removed successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Deletion failed" },
      { status: 500 }
    );
  }
}