// src/utils/localStorage.jsx
export const saveData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const loadData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const clearData = (key) => {
  localStorage.removeItem(key);
};

// Optional helper for teams by id
export const getTeamById = (id) => {
  const data = loadData("teams");
  if (!data) return null;
  const teams = Array.isArray(data.teams) ? data.teams : data;
  return teams.find((t) => t.id === id) || null;
};
