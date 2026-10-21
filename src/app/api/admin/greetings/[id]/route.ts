import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/admin-guard";
import { getGreetingsCollection } from "@/lib/mongodb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid greeting id." }, { status: 400 });
  }

  try {
    const collection = await getGreetingsCollection();
    const document = await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { ownerKey: 0 } },
    );

    if (!document) {
      return NextResponse.json(
        { error: "Greeting not found." },
        { status: 404 },
      );
    }

    const createdAt = document.createdAt ?? new Date();
    const photos = Array.isArray(document.photos) ? document.photos : [];

    return NextResponse.json({
      id: document._id.toString(),
      sender: document.sender,
      message: document.message,
      photos,
      photoCount: photos.length,
      occasion: document.occasion ?? "bijoya-dashami",
      isCustomized: document.isCustomized ?? true,
      createdAt: createdAt.toISOString(),
      updatedAt: (document.updatedAt ?? createdAt).toISOString(),
    });
  } catch (error) {
    console.error("Failed to load greeting:", error);
    return NextResponse.json(
      { error: "Could not load the greeting. Please try again." },
      { status: 500 },
    );
  }
}
