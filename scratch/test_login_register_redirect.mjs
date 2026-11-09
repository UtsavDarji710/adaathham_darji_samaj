import fs from "fs";
import assert from "assert";

console.log("=== VERIFYING LOGIN & REGISTRATION REDIRECT TO HOME PAGE ===");

// 1. Check Login Page redirect logic
const loginSrc = fs.readFileSync("src/app/login/page.tsx", "utf-8");
assert(
  loginSrc.includes('router.push("/")'),
  "Login page must redirect to home page ('/') upon successful login"
);
assert(
  !loginSrc.includes('role && role !== "member" ? "/admin" : "/"'),
  "Login page must not divert admin or president roles away from home page"
);
console.log("✓ Login page (/login) redirect to home page ('/') verified");

// 2. Check Home Page quick login redirect logic
const homeSrc = fs.readFileSync("src/app/page.tsx", "utf-8");
assert(
  !homeSrc.includes('router.push("/admin")'),
  "Home page quick login must not redirect admin roles to /admin"
);
assert(
  homeSrc.includes('router.push("/")'),
  "Home page quick login must redirect/refresh to home page ('/')"
);
console.log("✓ Home page quick login staying on home page ('/') verified");

// 3. Check Register Page redirect logic after OTP verification
const regSrc = fs.readFileSync("src/app/register/page.tsx", "utf-8");
assert(
  regSrc.includes('router.push("/")'),
  "Register page must redirect to home page ('/') upon OTP verification"
);
assert(
  !regSrc.includes('router.push("/profile")'),
  "Register page must no longer redirect to /profile"
);
console.log("✓ Register page (/register) redirect to home page ('/') after OTP verify verified");

console.log("=== ALL LOGIN & REGISTER HOME PAGE REDIRECT TESTS PASSED! ===");

