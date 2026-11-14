import test from "node:test";
import assert from "node:assert/strict";
import {
  filterExerciseReferences,
  readSavedReferences,
  toggleSavedReference,
  writeSavedReferences,
} from "../src/lib/catalogue.js";

const catalogue = [
  { id: "shoulder", name: "Shoulder raise", category: "Upper-body mobility", description: "Example catalogue entry.", professional_note: "Check professional guidance." },
  { id: "ankle", name: "Ankle mobility", category: "Gentle ankle movement", description: "Another example.", professional_note: "Ask a qualified professional." },
  { id: "seated", name: "Seated knee extension", category: "Lower-body movement", description: "A sample reference.", professional_note: "For discussion with a professional." },
];

test("filters by category case-insensitively", () => {
  assert.deepEqual(filterExerciseReferences(catalogue, { category: "gentle ankle movement" }).map((x) => x.id), ["ankle"]);
});

test("searches names, descriptions and professional notes", () => {
  assert.deepEqual(filterExerciseReferences(catalogue, { query: "SHOULDER" }).map((x) => x.id), ["shoulder"]);
  assert.deepEqual(filterExerciseReferences(catalogue, { query: "professional" }).map((x) => x.id), ["ankle", "seated"]);
});

test("All category preserves every matching entry", () => {
  assert.equal(filterExerciseReferences(catalogue, { category: "All" }).length, 3);
});

test("saved-only filtering and alphabetical sort work together", () => {
  assert.deepEqual(
    filterExerciseReferences(catalogue, { savedIds: ["shoulder", "ankle"], savedOnly: true, sort: "name" }).map((x) => x.id),
    ["ankle", "shoulder"],
  );
});

test("saved references can be added and removed without mutating the old list", () => {
  const original = ["ankle"];
  assert.deepEqual(toggleSavedReference(original, "shoulder"), ["ankle", "shoulder"]);
  assert.deepEqual(toggleSavedReference(original, "ankle"), []);
  assert.deepEqual(toggleSavedReference(original, ""), ["ankle"]);
  assert.deepEqual(original, ["ankle"]);
});

test("saved reference IDs round-trip through session storage", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.equal(writeSavedReferences(storage, ["ankle", "ankle", "shoulder"]), true);
  assert.deepEqual(readSavedReferences(storage), ["ankle", "shoulder"]);
});

test("corrupt saved-reference storage safely falls back to an empty list", () => {
  const storage = { getItem: () => "{broken" };
  assert.deepEqual(readSavedReferences(storage), []);
});
