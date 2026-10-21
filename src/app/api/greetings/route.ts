import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { uploadDataImage } from "@/lib/cloudinary";
import {
  classifyPhoto,
  isCloudinaryHostUrl,
  validateGreetingPayload,
  type GreetingPayloadInput,
} from "@/lib/greeting-validation";
import {
  getGreetingsCollection,
  type GreetingDocument,
} from "@/lib/mongodb";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getMaxRequestBodyBytes, getMessageLengthLimit } from "@/lib/server-limits";

function toSavedGreeting(document: GreetingDocument, id: string) {
  return {
    id,
    sender: document.sender,
    message: document.message,
    photos: Array.isArray(document.photos) ? document.photos : [],
    occasion: document.occasion ?? "bijoya-dashami",
    isCustomized: document.isCustomized ?? true,
    createdAt: (document.createdAt ?? new Date()).toISOString(),
    updatedAt: (document.updatedAt ?? document.createdAt ?? new Date()).toISOString(),
  };
}

export async function POST(request: Request) {
  const throttle = rateLimit(clientKey(request, "greetings"), 30, 10 * 60 * 1000);
  if (!throttle.ok) {
    return NextResponse.json(
      { error: "Too many saves from this device. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(throttle.retryAfterSeconds) } },
    );
  }

  const maxBytes = getMaxRequestBodyBytes();
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return NextResponse.json(
      { error: "That request is too large. Please send fewer or smaller photos." },
      { status: 413 },
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (rawBody.length > maxBytes) {
    return NextResponse.json(
      { error: "That request is too large. Please send fewer or smaller photos." },
      { status: 413 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = validateGreetingPayload(
    body as unknown as GreetingPayloadInput,
    getMessageLengthLimit(),
  );
  if (!payload.ok) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  const { sender, message, photos, occasion, id, ownerKey } = payload.value;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  const entries = photos.map(classifyPhoto);
  if (entries.some((entry) => entry.kind === "invalid")) {
    return NextResponse.json(
      { error: "One of the photos is not a supported image." },
      { status: 400 },
    );
  }

  const hasUploads = entries.some((entry) => entry.kind === "upload");
  const hasHosted = entries.some((entry) => entry.kind === "hosted");

  if (hasHosted && !cloudName) {
    return NextResponse.json(
      { error: "Photo storage is not configured." },
      { status: 503 },
    );
  }

  if (hasUploads && !cloudName) {
    // Text-only greetings keep working even when Cloudinary is unavailable.
    return NextResponse.json(
      {
        error:
          "Photo uploads are unavailable right now. Remove the photos or try again later.",
      },
      { status: 503 },
    );
  }

  const finalPhotos: string[] = [];
  for (const entry of entries) {
    if (entry.kind === "hosted") {
      if (!isCloudinaryHostUrl(entry.url, cloudName)) {
        return NextResponse.json(
          { error: "Only photos uploaded through this site can be attached." },
          { status: 400 },
        );
      }
      continue;
    }
    if (entry.kind === "invalid") continue; // already rejected above
    // entry.kind === "upload"
    try {
      finalPhotos.push(await uploadDataImage(entry.dataUrl));
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      return NextResponse.json(
        { error: "A photo could not be uploaded. Please try again." },
        { status: 502 },
      );
    }
  }

  try {
    const collection = await getGreetingsCollection();
    const now = new Date();
    const writeKey = ownerKey ?? new ObjectId().toHexString();

    const saved = {
      sender,
      message,
      photos: finalPhotos,
      occasion,
      isCustomized: true,
      createdAt: now,
      updatedAt: now,
    };

    if (id && ownerKey) {
      const existing = await collection.findOne(
        { _id: new ObjectId(id), ownerKey },
        { projection: { _id: 1 } },
      );

      if (existing) {
        await collection.updateOne(
          { _id: existing._id },
          {
            $set: {
              sender: saved.sender,
              message: saved.message,
              photos: saved.photos,
              occasion: saved.occasion,
              isCustomized: true,
              updatedAt: now,
            },
          },
        );

        const updated = await collection.findOne({ _id: existing._id });
        if (updated) {
          return NextResponse.json(toSavedGreeting(updated, updated._id.toString()));
        }
      }
    }

    const document: GreetingDocument = { ...saved, ownerKey: writeKey };
    const result = await collection.insertOne(document);

    return NextResponse.json(toSavedGreeting(document, result.insertedId.toString()));
  } catch (error) {
    console.error("Failed to save greeting:", error);
    return NextResponse.json(
      { error: "Could not save the greeting. Please try again." },
      { status: 500 },
    );
  }
}
