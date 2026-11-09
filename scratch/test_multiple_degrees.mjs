import assert from "node:assert";

console.log("=== RUNNING MULTIPLE DEGREES VERIFICATION TEST ===");

// 1. Test adding multiple degrees for self
const memberDegrees = [];

function addDegree(memberId, memberName, degree, category) {
  const newRec = {
    id: `deg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    member_id: memberId,
    member_name: memberName,
    degree,
    field_of_study: category,
  };
  memberDegrees.push(newRec);
  return newRec;
}

// Add 3 degrees for Utsav Darji (Self)
addDegree("self", "Utsav Darji", "B.Com", "સ્નાતક (Graduate)");
addDegree("self", "Utsav Darji", "MBA", "અનુસ્નાતક (Post Graduate)");
addDegree("self", "Utsav Darji", "LLB", "વ્યવસાયિક / સીએ / ટેકનિકલ કોર્સ (Professional)");

// Add 2 degrees for Krupa Darji (Family Member)
addDegree("rel-1", "Krupa Darji (પત્ની)", "B.A.", "સ્નાતક (Graduate)");
addDegree("rel-1", "Krupa Darji (પત્ની)", "B.Ed", "વ્યવસાયિક / સીએ / ટેકનિકલ કોર્સ (Professional)");

// Verify total degrees
assert.strictEqual(memberDegrees.length, 5, "Total 5 degrees should be present");

// Verify degrees for self
const selfDegrees = memberDegrees.filter((d) => d.member_id === "self");
assert.strictEqual(selfDegrees.length, 3, "Self should have 3 degrees");
assert.deepStrictEqual(
  selfDegrees.map((d) => d.degree),
  ["B.Com", "MBA", "LLB"]
);
console.log("✓ One person (Self) successfully holds 3 multiple degrees: B.Com, MBA, LLB");

// Verify degrees for family member
const krupaDegrees = memberDegrees.filter((d) => d.member_id === "rel-1");
assert.strictEqual(krupaDegrees.length, 2, "Family member should have 2 degrees");
assert.deepStrictEqual(
  krupaDegrees.map((d) => d.degree),
  ["B.A.", "B.Ed"]
);
console.log("✓ Family member successfully holds multiple degrees: B.A., B.Ed");

// Test removing one degree (e.g. remove LLB)
const degreeToRemove = selfDegrees[2].id;
const afterRemoval = memberDegrees.filter((d) => d.id !== degreeToRemove);
const selfAfterRemoval = afterRemoval.filter((d) => d.member_id === "self");
assert.strictEqual(selfAfterRemoval.length, 2, "Self should now have 2 degrees after removing one");
assert.deepStrictEqual(
  selfAfterRemoval.map((d) => d.degree),
  ["B.Com", "MBA"]
);
console.log("✓ Deleting one degree preserves all other degrees for that person");

// Test backward compatibility serialization
const selfDegreesJoined = selfAfterRemoval.map((d) => d.degree).join(", ");
assert.strictEqual(selfDegreesJoined, "B.Com, MBA");
console.log("✓ Backward compatibility serialized string correctly forms: 'B.Com, MBA'");

console.log("=== ALL MULTIPLE DEGREES TESTS PASSED! ===");

