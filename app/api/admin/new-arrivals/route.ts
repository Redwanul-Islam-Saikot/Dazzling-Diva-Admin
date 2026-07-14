import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import NewArrival from "@/models/NewArrival";

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

export async function GET() {
  try {
    await connectDB();
    const items = await NewArrival.find({}).sort({ order: 1 });
    return NextResponse.json({ success: true, data: items }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const item = await NewArrival.create({
      name: body.name,
      price: body.price,
      image: body.image,
      order: body.order,
      status: body.status,
    });
    return NextResponse.json(
      { success: true, message: "Product added successfully!", data: item },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product id is required." },
        { status: 400, headers: corsHeaders() }
      );
    }
    const updated = await NewArrival.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(
      { success: true, message: "Product updated successfully!", data: updated },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product id is required." },
        { status: 400, headers: corsHeaders() }
      );
    }
    await NewArrival.findByIdAndDelete(id);
    return NextResponse.json(
      { success: true, message: "Product deleted successfully!" },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}