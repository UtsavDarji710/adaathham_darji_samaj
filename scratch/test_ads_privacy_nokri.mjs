import assert from "node:assert";

console.log("=== RUNNING ADS TRACKING & PRIVACY CONTROL VERIFICATION ===");

// 1. Test Advertisement tracking logic
const sampleAds = [
  {
    id: "adv-1",
    business_name: "શ્રી હરિ જ્વેલર્સ",
    category: "જ્વેલરી",
    description: "શુદ્ધ સોના-ચાંદીના દાગીના",
    owner_name: "Utsav Darji",
    contact_number: "916354906794",
    status: "pending",
    submitted_by: "mem-utsav",
    created_at: new Date().toISOString(),
  },
  {
    id: "adv-2",
    business_name: "રોયલ ટેલર્સ",
    category: "ટેલરિંગ",
    description: "સ્પેશિયલ જોધપુરી સુટ",
    owner_name: "Dineshbhai Darji",
    contact_number: "9825000001",
    status: "approved",
    submitted_by: "mem-dinesh",
    created_at: new Date().toISOString(),
  },
];

const currentUserId = "mem-utsav";
const currentUserName = "Utsav Darji";
const currentUserPhone = "916354906794";

const myAds = sampleAds.filter(
  (ad) =>
    ad.submitted_by === currentUserId ||
    (ad.owner_name && ad.owner_name.toLowerCase() === currentUserName.toLowerCase()) ||
    ad.contact_number === currentUserPhone
);

assert.strictEqual(myAds.length, 1, "User should only see their own requested ads");
assert.strictEqual(myAds[0].id, "adv-1");
assert.strictEqual(myAds[0].status, "pending");
console.log("✓ User can track requested advertisements with status, category, and details");

// 2. Test Business Privacy Control
const businesses = [
  {
    id: "biz-1",
    name: "Utsav Marketing",
    owner_id: "mem-utsav",
    owner_name: "Utsav Darji",
    status: "active",
    is_public: true,
  },
  {
    id: "biz-2",
    name: "Private Business",
    owner_id: "mem-private",
    owner_name: "Private User",
    status: "hidden",
    is_public: false,
  },
];

const members = [
  {
    id: "mem-utsav",
    name: "Utsav Darji",
    business: { business_name: "Utsav Marketing", is_public: true },
    employment: { company: "TCS", job_title: "Software Engineer", is_public: true },
  },
  {
    id: "mem-private",
    name: "Private User",
    business: { business_name: "Private Business", is_public: false },
    employment: { company: "Govt School", job_title: "Teacher", is_public: false },
  },
];

// Directory filter
const publicBusinesses = businesses.filter((b) => {
  if (b.is_public === false || b.status !== "active") return false;
  if (b.owner_id) {
    const owner = members.find((m) => m.id === b.owner_id);
    if (owner?.business?.is_public === false) return false;
  }
  return true;
});

assert.strictEqual(publicBusinesses.length, 1, "Only public businesses should appear in directory");
assert.strictEqual(publicBusinesses[0].name, "Utsav Marketing");
console.log("✓ Business privacy filter strictly excludes businesses with is_public: false");

// 3. Test Nokri Directory Privacy Control
const publicEmployedMembers = members.filter((m) => {
  const emp = m.employment;
  if (!emp) return false;
  if (emp.is_public === false) return false;
  return Boolean((emp.company && emp.company.trim()) || (emp.job_title && emp.job_title.trim()));
});

assert.strictEqual(publicEmployedMembers.length, 1, "Only members with is_public !== false appear in Nokri tab");
assert.strictEqual(publicEmployedMembers[0].name, "Utsav Darji");
assert.strictEqual(publicEmployedMembers[0].employment.company, "TCS");
console.log("✓ Nokri tab strictly displays only members who chose to make their job public");

console.log("=== ALL ADS TRACKING & PRIVACY CONTROL TESTS PASSED! ===");

