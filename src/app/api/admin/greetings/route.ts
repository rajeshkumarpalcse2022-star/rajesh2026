import { NextResponse } from "next/server";
import type { Filter } from "mongodb";
import { requireAdmin } from "@/lib/admin-guard";
import { escapeRegExp } from "@/lib/greeting-validation";
import {
  getGreetingsCollection,
  type GreetingDocument,
} from "@/lib/mongodb";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

interface AdminGreetingItem {
  id: string;
  sender: string;
  message: string;
  photos: string[];
  photoCount: number;
  occasion: string;
  isCustomized: boolean;
  createdAt: string;
  updatedAt: string;
}

function toAdminItem(document: GreetingDocument): AdminGreetingItem {
  const photos = Array.isArray(document.photos) ? document.photos : [];
  const createdAt = document.createdAt ?? new Date();
  return {
    id: document._id.toString(),
    sender: document.sender,
    message: document.message,
    photos,
    photoCount: photos.length,
    occasion: document.occasion ?? "bijoya-dashami",
    isCustomized: document.isCustomized ?? true,
    createdAt: createdAt.toISOString(),
    updatedAt: (document.updatedAt ?? createdAt).toISOString(),
  };
}

function positiveInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Dates are calendar days in Indian Standard Time. */
function istDayStart(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00+05:30`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function istDayEnd(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T23:59:59.999+05:30`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const url = new URL(request.url);
  const query = url.searchParams;

  const search = (query.get("q") ?? "").trim().slice(0, 120);
  const page = Math.min(positiveInt(query.get("page"), 1), 10_000);
  const pageSize = Math.min(
    positiveInt(query.get("pageSize"), DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const photosFilter = query.get("photos");
  const from = istDayStart(query.get("from"));
  const to = istDayEnd(query.get("to"));
  const sortDirection: 1 | -1 =
    query.get("sort") === "oldest" ? 1 : -1;

  const filter: Filter<GreetingDocument> = {};

  if (search) {
    const pattern = new RegExp(escapeRegExp(search), "i");
    filter.$or = [{ sender: pattern }, { message: pattern }];
  }

  if (photosFilter === "true") {
    filter.photos = { $exists: true, $ne: [] };
  } else if (photosFilter === "false") {
    filter.$and = [{ $or: [{ photos: { $exists: false } }, { photos: { $size: 0 } }] }];
  }

  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.$gte = from;
    if (to) range.$lte = to;
    filter.createdAt = range;
  }

  try {
    const collection = await getGreetingsCollection();

    const [total, documents, statRows] = await Promise.all([
      collection.countDocuments(filter),
      collection
        .find(filter, { projection: { ownerKey: 0 } })
        .sort({ createdAt: sortDirection })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
      collection
        .aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              customized: {
                $sum: { $cond: [{ $ne: ["$isCustomized", false] }, 1, 0] },
              },
              photos: { $sum: { $size: { $ifNull: ["$photos", []] } } },
              latest: { $max: "$createdAt" },
            },
          },
        ])
        .toArray(),
    ]);

    const statsRow = statRows[0] as
      | {
          total?: number;
          customized?: number;
          photos?: number;
          latest?: Date | null;
        }
      | undefined;

    return NextResponse.json({
      items: documents.map(toAdminItem),
      total,
      page,
      pageSize,
      stats: {
        total: statsRow?.total ?? 0,
        customized: statsRow?.customized ?? 0,
        photos: statsRow?.photos ?? 0,
        latest: statsRow?.latest ? statsRow.latest.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("Failed to list greetings:", error);
    return NextResponse.json(
      { error: "Could not load greetings right now. Please try again." },
      { status: 500 },
    );
  }
}
