const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase();

export function filterExerciseReferences(exercises, {
  category = "All",
  query = "",
  savedIds = [],
  savedOnly = false,
  sort = "default",
} = {}) {
  const search = normalize(query);
  const matches = exercises.filter((item) => {
    const matchesCategory = category === "All" || normalize(item.category) === normalize(category);
    const searchable = [
      item.name,
      item.category,
      item.description,
      item.professional_note,
    ].filter(Boolean).map(normalize).join(" ");
    const matchesSaved = !savedOnly || savedIds.includes(item.id);
    return matchesCategory && matchesSaved && (!search || searchable.includes(search));
  });

  if (sort === "name" || sort === "category") {
    matches.sort((left, right) => {
      const comparison = normalize(left[sort]).localeCompare(normalize(right[sort]));
      return comparison || normalize(left.name).localeCompare(normalize(right.name));
    });
  }
  return matches;
}

export function toggleSavedReference(current, id) {
  if (!id) return [...current];
  return current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
}

export function readSavedReferences(storage) {
  if (!storage) return [];
  try {
    const value = JSON.parse(storage.getItem("reform.saved-reference-ids") || "[]");
    return Array.isArray(value)
      ? [...new Set(value.filter((id) => typeof id === "string" && id.length <= 80))]
      : [];
  } catch {
    return [];
  }
}

export function writeSavedReferences(storage, ids) {
  if (!storage) return false;
  try {
    storage.setItem("reform.saved-reference-ids", JSON.stringify([...new Set(ids)]));
    return true;
  } catch {
    return false;
  }
}


function csvCell(value) {
  return "\"" + String(value ?? "").replace(/\"/g, "\"\"") + "\"";
}

export function buildDiscussionCsv(exercises = [], savedIds = []) {
  const byId = new Map(exercises.map((item) => [item.id, item]));
  const headers = ["id", "name", "category", "description", "professional_note"];
  const rows = savedIds.map((id) => byId.get(id)).filter(Boolean).map((item) => [
    item.id,
    item.name,
    item.category,
    item.description,
    item.professional_note,
  ]);
  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}
