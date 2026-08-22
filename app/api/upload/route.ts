// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const BLOCKED_EXTENSIONS = /\.(exe|bat|sh|cmd|msi|dmg|apk|bin|scr|vbs|ps1|jar)$/i
const BLOCKED_MIME_TYPES = new Set([
  "video/mp4", "video/avi", "video/quicktime", "video/x-matroska",
  "video/x-msvideo", "video/webm", "video/ogg",
  "application/x-msdownload", "application/x-executable",
  "application/x-sh", "application/x-bat",
])
const MAX_MB = 10

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
  if (BLOCKED_MIME_TYPES.has(file.type) || BLOCKED_EXTENSIONS.test(file.name)) {
    return NextResponse.json({ error: "That file type isn't allowed." }, { status: 400 })
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    return NextResponse.json({ error: `File too large — keep it under ${MAX_MB}MB.` }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "auto", folder: "apexbyteshub" }, (err, res) => {
          if (err || !res) return reject(err)
          resolve(res as { secure_url: string })
        })
        .end(buffer)
    })
    return NextResponse.json({ secure_url: result.secure_url })
  } catch {
    return NextResponse.json({ error: "Upload failed on our end. Please try again." }, { status: 500 })
  }
  }
