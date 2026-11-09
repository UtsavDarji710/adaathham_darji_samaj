"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminFamiliesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-xs text-charcoal-500">એડમિન ડેશબોર્ડ પર રીડાયરેક્ટ થઈ રહ્યું છે...</p>
    </div>
  );
}
