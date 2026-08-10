import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ all: string[] }> }
) {
  await params;
  return getAuth().handler(request);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ all: string[] }> }
) {
  await params;
  return getAuth().handler(request);
}
