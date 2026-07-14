import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb"; // যদি আপনার প্রজেক্টে dbConnect থাকে তবে সেটা লিখবেন
import Footer from "@/models/Footer";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// CORS হেডার হ্যান্ডেল করার ফাংশন (ফ্রন্টএন্ড ৩০০১ পোর্টের জন্য)
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:3001", 
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Cache-Control, Pragma",
  };
}

// OPTIONS রিকোয়েস্ট (CORS প্রি-ফ্লাইটের জন্য)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// ১. GET রিকোয়েস্ট (অ্যাডমিন প্যানেল এবং ফ্রন্টএন্ড দুই জায়গাই ডাটা দেখবে)
export async function GET() {
  try {
    await connectDB(); // ডাটাবেজ কানেক্ট করা হচ্ছে
    const footerData = await Footer.findOne();
    
    return NextResponse.json(
      { success: true, data: footerData }, 
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message }, 
      { status: 500, headers: corsHeaders() }
    );
  }
}

// ২. POST রিকোয়েস্ট (অ্যাডমিন প্যানেল থেকে ডাটা সেভ/আপডেট করার জন্য)
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    const updatedFooter = await Footer.findOneAndUpdate({}, body, {
      new: true,
      upsert: true,
    });

    return NextResponse.json(
      { success: true, message: "Footer updated!", data: updatedFooter },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message }, 
      { status: 500, headers: corsHeaders() }
    );
  }
}