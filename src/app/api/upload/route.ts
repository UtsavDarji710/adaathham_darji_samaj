import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { INITIAL_MEMBERS } from "@/lib/mockData";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/gif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const BUCKET_POLICIES = {
  "member-photos": { isPublic: true },
  "business-photos": { isPublic: true },
  "advertisement-banners": { isPublic: true },
  "donor-photos": { isPublic: true },
  "samiti-assets": { isPublic: true, requireAdmin: true },
  "payment-proofs": { isPublic: false }, // Private sensitive storage (Requirement 15)
};

const ADMIN_ROLES = [
  "president",
  "secretary",
  "joint_secretary",
  "treasurer",
  "assistant_treasurer",
  "admin",
];

export async function POST(request: Request) {
  try {
    // 1. Authenticate Request via Session Cookie (Task 2 Requirement 10 & Task 3)
    const cookieStore = cookies();
    const sessionVal = cookieStore.get("ad8_session")?.value;

    if (!sessionVal || sessionVal === "guest") {
      return NextResponse.json(
        {
          success: false,
          message: "અનધિકૃત પ્રવેશ. કૃપા કરીને પ્રથમ લૉગિન કરો (Unauthorized. Please log in).",
        },
        { status: 401 }
      );
    }

    const cleanSession = decodeURIComponent(sessionVal).trim().toLowerCase();
    const user = INITIAL_MEMBERS.find((m) => {
      if (m.email && m.email.toLowerCase() === cleanSession) return true;
      if (m.phone && m.phone.replace(/\D/g, "") === cleanSession.replace(/\D/g, "")) return true;
      if (m.id && m.id.toLowerCase() === cleanSession) return true;
      return false;
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "અમાન્ય સત્ર. કૃપા કરીને ફરી લૉગિન કરો (Invalid session).",
        },
        { status: 401 }
      );
    }

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as keyof typeof BUCKET_POLICIES) || "member-photos";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "કોઈ ફાઇલ મળી નથી." },
        { status: 400 }
      );
    }

    // 3. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          message: "અમાન્ય ફાઇલ પ્રકાર. ફક્ત JPEG, PNG, WEBP અથવા GIF ફાઇલ જ માન્ય છે.",
        },
        { status: 400 }
      );
    }

    // 4. Validate file size (max 5MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "ફાઇલ કદ 5MB કરતાં ઓછું હોવું આવશ્યક છે.",
        },
        { status: 400 }
      );
    }

    // 5. Validate File Content (Check not zero length)
    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ફાઇલ ખાલી છે. કૃપા કરીને માન્ય તસવીર અપલોડ કરો.",
        },
        { status: 400 }
      );
    }

    // 6. Role-based check for protected categories (e.g. samiti official assets)
    const bucketConfig = BUCKET_POLICIES[category] || { isPublic: true, requireAdmin: false };
    if ((bucketConfig as any).requireAdmin && !ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "આ કેટેગરીમાં ફાઇલ અપલોડ કરવા માટે એડમિન પરવાનગી જરૂરી છે.",
        },
        { status: 403 }
      );
    }

    const extension = file.name.split(".").pop() || "jpg";
    const filename = `${category}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

    // 7. If Supabase is configured with real credentials, upload to bucket
    if (isSupabaseConfigured()) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { data, error } = await supabase.storage
        .from(category)
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("[Supabase Storage Upload Error]", error);
        return NextResponse.json(
          { success: false, message: "સ્ટોરેજમાં ફાઇલ અપલોડ કરવામાં નિષ્ફળ." },
          { status: 500 }
        );
      }

      let fileUrl = "";
      if (bucketConfig.isPublic) {
        const { data: publicData } = supabase.storage.from(category).getPublicUrl(filename);
        fileUrl = publicData.publicUrl;
      } else {
        // Private signed URL for sensitive payment proofs
        const { data: signedData } = await supabase.storage.from(category).createSignedUrl(filename, 3600);
        fileUrl = signedData?.signedUrl || filename;
      }

      return NextResponse.json({
        success: true,
        url: fileUrl,
        filePath: filename,
        category,
        isPrivate: !bucketConfig.isPublic,
      });
    }

    // 8. Fallback/Local Development mode:
    // Convert to Base64 data URL for instant live preview without external storage dependency
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filePath: filename,
      category,
      isPrivate: !bucketConfig.isPublic,
      message: "ફાઇલ સફળતાપૂર્વક અપલોડ થઈ.",
    });
  } catch (error: any) {
    console.error("[Upload error]", error);
    return NextResponse.json(
      { success: false, message: "ફાઇલ અપલોડમાં ક્ષતિ આવી." },
      { status: 500 }
    );
  }
}
