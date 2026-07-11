import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
// 1. READ: সব ক্যাটাগরি লিস্ট নিয়ে আসা
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Fetch failed" }, { status: 500 });
  }
}

// 2. CREATE: নতুন ক্যাটাগরি তৈরি
export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, slug, imageUrl } = await request.json();

    const newCategory = await Category.create({ name, slug, imageUrl });
    return NextResponse.json({ success: true, message: "Category created successfully!", data: newCategory });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Creation failed" }, { status: 500 });
  }
}

// 3. UPDATE: ক্যাটাগরি এডিট করা
export async function PUT(request: Request) {
  try {
    await connectDB();
    const { id, name, slug, imageUrl } = await request.json();

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, slug, imageUrl },
      { new: true }
    );
    return NextResponse.json({ success: true, message: "Category updated successfully!", data: updatedCategory });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

// 4. DELETE: ক্যাটাগরি ডিলিট করা
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Category deleted successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}