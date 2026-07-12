import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import HeroSlider from "@/models/HeroSlider";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:3001",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Cache-Control, Pragma",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// সব স্লাইড দেখা (Admin panel-এর টেবিলের জন্য, active/inactive দুটোই)
export async function GET() {
  try {
    await connectDB();
    const sliders = await HeroSlider.find({}).sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, data: sliders },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// নতুন স্লাইড তৈরি
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const slider = await HeroSlider.create({
      tagline: body.tagline,
      title: body.title,
      badgeText: body.badgeText,
      imageUrl: body.imageUrl,
      status: body.status,
    });

    return NextResponse.json(
      { success: true, message: "Slider added successfully!", data: slider },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// স্লাইড এডিট (id, body-তে আসছে)
export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Slider id is required." },
        { status: 400, headers: corsHeaders() }
      );
    }

    const updated = await HeroSlider.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json(
      { success: true, message: "Slider updated successfully!", data: updated },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// স্লাইড ডিলিট (id, query param-এ আসছে: /api/admin/hero?id=...)
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Slider id is required." },
        { status: 400, headers: corsHeaders() }
      );
    }

    await HeroSlider.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Slider deleted successfully!" },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}