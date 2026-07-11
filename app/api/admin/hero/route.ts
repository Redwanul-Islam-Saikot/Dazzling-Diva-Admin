import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb"; 
import HeroSlider from "@/models/HeroSlider";

// ১. READ: সব স্লাইডার নিয়ে আসা
export async function GET() {
  try {
    await connectDB();
    const sliders = await HeroSlider.find().sort({ createdAt: -1 }); 
    return NextResponse.json({ success: true, data: sliders });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Fetch failed" }, { status: 500 });
  }
}

// ২. CREATE: নতুন স্লাইডার তৈরি করা
export async function POST(request: Request) {
  try {
    await connectDB();
    const { tagline, title, badgeText, imageUrl, status } = await request.json();

    if (!title || !imageUrl) {
      return NextResponse.json({ success: false, message: "Title and Image URL are required" }, { status: 400 });
    }

    const newSlider = await HeroSlider.create({ 
      tagline, 
      title, 
      badgeText, 
      imageUrl, 
      status: status || "active" 
    });
    return NextResponse.json({ success: true, message: "Slider created successfully!", data: newSlider });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Creation failed" }, { status: 500 });
  }
}

// ৩. UPDATE: স্লাইডার এডিট/আপডেট করা
export async function PUT(request: Request) {
  try {
    await connectDB();
    const { id, tagline, title, badgeText, imageUrl, status } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "Slider ID is required" }, { status: 400 });
    }

    const updatedSlider = await HeroSlider.findByIdAndUpdate(
      id,
      { tagline, title, badgeText, imageUrl, status },
      { new: true }
    );

    if (!updatedSlider) {
      return NextResponse.json({ success: false, message: "Slider not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Slider updated successfully!", data: updatedSlider });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

// ৪. DELETE: স্লাইডার মুছে ফেলা
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Slider ID is required" }, { status: 400 });
    }

    const deletedSlider = await HeroSlider.findByIdAndDelete(id);

    if (!deletedSlider) {
      return NextResponse.json({ success: false, message: "Slider not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Slider deleted successfully!" });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Deletion failed" }, { status: 500 });
  }
}