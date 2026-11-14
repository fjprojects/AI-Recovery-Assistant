export function filterExerciseReferences(exercises, { category = "All", query = "" } = {}) {
  const search = String(query).trim().toLocaleLowerCase();
  return exercises.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const haystack = [item.name, item.category, item.description]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return matchesCategory && haystack.includes(search);
  });
}

export function toggleSavedReference(current, id) {
  return current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
}
