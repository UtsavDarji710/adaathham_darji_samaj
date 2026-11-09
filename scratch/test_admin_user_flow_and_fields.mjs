import fs from "fs";
import assert from "assert";

console.log("=== RUNNING ADMIN USER MANAGEMENT & PROFILE JATI/DOD AUDIT TEST ===");

// 1. Verify types in src/types/index.ts
const typesSrc = fs.readFileSync("src/types/index.ts", "utf-8");
assert(typesSrc.includes("jati?: string;"), "Member interface must contain 'jati' field");
assert(typesSrc.includes("dod?: string;"), "Member interface must contain 'dod' field");
assert(typesSrc.includes("is_deceased?: boolean;"), "Member interface must contain 'is_deceased' field");
console.log("✓ Types in src/types/index.ts properly include jati, dod, and is_deceased");

// 2. Verify Admin Members page has "+ સભ્ય ઉમેરો" and Edit pencil links to /profile?memberId=
const adminMembersSrc = fs.readFileSync("src/app/admin/members/page.tsx", "utf-8");
assert(
  adminMembersSrc.includes('href="/profile?action=new"'),
  "Admin members page must feature '+ સભ્ય ઉમેરો' button linking to /profile?action=new"
);
assert(
  adminMembersSrc.includes("UserPlus"),
  "Admin members page must use UserPlus icon for adding member"
);
assert(
  adminMembersSrc.includes("href={`/profile?memberId=${m.id}`}") && adminMembersSrc.includes("<Edit3"),
  "Admin members page Edit pencil icon must link to /profile?memberId=${m.id}"
);
assert(
  adminMembersSrc.includes("m.dod"),
  "Admin members page must show deceased badge when dod is set"
);
console.log("✓ Admin members page (+ સભ્ય ઉમેરો & Edit pencil profile flow) verified");

// 3. Verify Profile page supports admin full edit & add new member flow
const profileSrc = fs.readFileSync("src/app/profile/page.tsx", "utf-8");
assert(
  profileSrc.includes("isAddingNewMember"),
  "Profile page must support isAddingNewMember state"
);
assert(
  profileSrc.includes('href="/admin/members"'),
  "Profile page admin banner must feature back button to /admin/members"
);
assert(
  profileSrc.includes("jati") && profileSrc.includes("setJati"),
  "Profile page must maintain jati state"
);
assert(
  profileSrc.includes("dod") && profileSrc.includes("setDod"),
  "Profile page must maintain dod state"
);
assert(
  profileSrc.includes("dob") && profileSrc.includes("setDob"),
  "Profile page must maintain dob state"
);
assert(
  profileSrc.includes('label className="block text-xs font-bold text-charcoal-700 mb-1">\n                જાતિ (Jati / Caste) *') ||
  profileSrc.includes("જાતિ (Jati / Caste)"),
  "Profile page General Info tab must include Jati field"
);
assert(
  profileSrc.includes("અવસાન તારીખ (Date of Death"),
  "Profile page General Info tab must include Date of Death field"
);
console.log("✓ Profile page Admin full edit & jati/dod inputs verified");

// 4. Verify /api/members supports POST for adding new members
const membersApiSrc = fs.readFileSync("src/app/api/members/route.ts", "utf-8");
assert(
  membersApiSrc.includes("export async function POST"),
  "/api/members must implement POST endpoint for admin member registration"
);
console.log("✓ /api/members POST endpoint verified");

console.log("=== ALL ADMIN USER EDIT FLOW & JATI/DOD TESTS PASSED SUCCESSFULLY! ===");
