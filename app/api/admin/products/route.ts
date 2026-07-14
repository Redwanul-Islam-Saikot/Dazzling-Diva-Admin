import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

// 1. READ: সব প্রোডাক্ট নিয়ে আসা
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Fetch failed" }, { status: 500 });
  }
}

// 2. CREATE: নতুন প্রোডাক্ট যোগ করা
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, slug, description, price, oldPrice, category, stock, imageUrl, isFeatured } = body;

    if (!name || !slug || !description || !price || !category || !imageUrl) {
      return NextResponse.json(
        { success: false, message: "Name, slug, description, price, category and image are all required." },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      name, slug, description, price, oldPrice, category, stock, imageUrl, isFeatured
    });

    return NextResponse.json({ success: true, message: "Product added successfully!", data: newProduct });
  } catch (error: any) {
    console.error("Product creation error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "A product with this slug already exists. Try a different product name." },
        { status: 400 }
      );
    }

    if (error.name === "ValidationError") {
      const fields = Object.keys(error.errors).join(", ");
      return NextResponse.json(
        { success: false, message: `Missing/invalid field(s): ${fields}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Creation failed" },
      { status: 500 }
    );
  }
}

// 3. UPDATE: প্রোডাক্ট এডিট করা
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, name, slug, description, price, oldPrice, category, stock, imageUrl, isFeatured } = body;

    if (!id) return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, slug, description, price, oldPrice, category, stock, imageUrl, isFeatured },
      { new: true }
    );

    return NextResponse.json({ success: true, message: "Product updated successfully!", data: updatedProduct });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

// 4. DELETE: প্রোডাক্ট ডিলিট করা
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Product deleted successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}