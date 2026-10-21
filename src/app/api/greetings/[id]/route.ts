import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getGreetingsCollection } from "@/lib/mongodb";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const throttle = rateLimit(clientKey(request, "greeting-get"), 120, 60 * 1000);
  if (!throttle.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid greeting id." }, { status: 400 });
  }

  try {
    const collection = await getGreetingsCollection();
    const document = await collection.findOne({ _id: new ObjectId(id) });

    if (!document) {
      return NextResponse.json(
        { error: "Greeting not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: document._id.toString(),
      sender: document.sender,
      message: document.message,
      photos: Array.isArray(document.photos) ? document.photos : [],
      occasion: document.occasion ?? "bijoya-dashami",
      isCustomized: document.isCustomized ?? true,
      createdAt: (document.createdAt ?? new Date()).toISOString(),
      updatedAt: (
        document.updatedAt ?? document.createdAt ?? new Date()
      ).toISOString(),
    });
  } catch (error) {
    console.error("Failed to load greeting:", error);
    return NextResponse.json(
      { error: "Could not load the greeting. Please try again." },
      { status: 500 },
    );
  }
}
