import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FlashSale from "@/models/FlashSale"; // মডেল ফাইলটি ঠিক করে নেবেন

export async function GET() {
  try {
    await connectDB();
    const campaigns = await FlashSale.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Fetch failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { title, subtitle, endTime, imageUrl } = await request.json();

    // ভ্যালিডেশন চেক
    if (!title || !endTime || !imageUrl) {
      return NextResponse.json({ success: false, message: "Required fields missing" }, { status: 400 });
    }

    const newCampaign = await FlashSale.create({
      title, subtitle, endTime, imageUrl
    });
    return NextResponse.json({ success: true, message: "Flash Sale Created!", data: newCampaign });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Creation failed" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { id, title, subtitle, endTime, imageUrl } = await request.json();

    const updated = await FlashSale.findByIdAndUpdate(
      id,
      { title, subtitle, endTime, imageUrl },
      { new: true }
    );
    return NextResponse.json({ success: true, message: "Flash Sale updated!", data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await FlashSale.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Campaign removed!" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Deletion failed" }, { status: 500 });
  }
}