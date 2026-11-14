import test from "node:test";
import assert from "node:assert/strict";
import { filterExerciseReferences, toggleSavedReference } from "../src/lib/catalogue.js";

const catalogue = [
  { id: "shoulder", name: "Shoulder raise", category: "Upper-body mobility", description: "Example catalogue entry." },
  { id: "ankle", name: "Ankle mobility", category: "Gentle ankle movement", description: "Another example." },
  { id: "seated", name: "Seated knee extension", category: "Lower-body movement", description: "A sample reference." },
];

test("filters by category", () => {
  assert.deepEqual(filterExerciseReferences(catalogue, { category: "Gentle ankle movement" }).map((x) => x.id), ["ankle"]);
});

test("searches names and descriptions case-insensitively", () => {
  assert.deepEqual(filterExerciseReferences(catalogue, { query: "SHOULDER" }).map((x) => x.id), ["shoulder"]);
});

test("All category preserves every matching entry", () => {
  assert.equal(filterExerciseReferences(catalogue, { category: "All" }).length, 3);
});

test("saved references can be added and removed without mutating the old list", () => {
  const original = ["ankle"];
  assert.deepEqual(toggleSavedReference(original, "shoulder"), ["ankle", "shoulder"]);
  assert.deepEqual(toggleSavedReference(original, "ankle"), []);
  assert.deepEqual(original, ["ankle"]);
});
