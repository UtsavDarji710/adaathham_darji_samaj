import assert from "assert";

console.log("=== RUNNING BUSINESS REMOVAL & SYNC VERIFICATION TEST ===");

// 1. Test filtering logic when member has removed their business
const mockMembers = [
  {
    id: "mem-utsav",
    name: "Utsav Darji",
    phone: "+916354906794",
    // Business was completely removed or cleared
    business: undefined,
  },
  {
    id: "mem-dharmik",
    name: "Dharmik Parmar",
    phone: "98250 31031",
    business: {
      business_name: "Maruti Classes",
      is_public: true,
    },
  },
  {
    id: "mem-private",
    name: "Private Business Owner",
    phone: "99999 11111",
    business: {
      business_name: "Private Biz",
      is_public: false, // User selected NOT to show
    },
  },
];

const mockBusinesses = [
  {
    id: "biz-1",
    owner_id: "mem-utsav",
    owner_name: "Utsav Darji",
    name: "Dhaval marketing",
    phone: "+916354906794",
    status: "active",
    is_public: true,
  },
  {
    id: "biz-2",
    owner_id: "mem-dharmik",
    owner_name: "Dharmik Parmar",
    name: "Maruti Classes",
    phone: "98250 31031",
    status: "active",
    is_public: true,
  },
  {
    id: "biz-3",
    owner_id: "mem-private",
    owner_name: "Private Business Owner",
    name: "Private Biz",
    phone: "99999 11111",
    status: "active",
    is_public: true,
  },
];

// Replicate filtering function from businesses page
function filterPublicBusinesses(businesses, members) {
  return businesses.filter((b) => {
    if (b.is_public === false || b.status !== "active") return false;

    const cleanPhone = b.phone ? b.phone.replace(/\D/g, "") : "";
    const ownerMember = members.find(
      (m) =>
        (b.owner_id && (m.id === b.owner_id || m.auth_user_id === b.owner_id)) ||
        (cleanPhone && m.phone && m.phone.replace(/\D/g, "") === cleanPhone)
    );
    if (ownerMember) {
      if (
        !ownerMember.business ||
        !ownerMember.business.business_name?.trim() ||
        ownerMember.business.is_public === false
      ) {
        return false;
      }
    }
    return true;
  });
}

const visibleBusinesses = filterPublicBusinesses(mockBusinesses, mockMembers);
console.log("Visible businesses:", visibleBusinesses.map((b) => b.name));

assert.strictEqual(visibleBusinesses.length, 1, "Only active public business with valid owner business should be visible");
assert.strictEqual(visibleBusinesses[0].name, "Maruti Classes");
assert(!visibleBusinesses.some((b) => b.name === "Dhaval marketing"), "Removed business must not be shown");
assert(!visibleBusinesses.some((b) => b.name === "Private Biz"), "Private business must not be shown");

console.log("✓ Removed and private businesses are strictly excluded from business directory!");
console.log("=== ALL BUSINESS REMOVAL TESTS PASSED! ===");

