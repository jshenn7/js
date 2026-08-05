export const PROFILE_KEY = "fingo-profile-v1";

export type UserProfile = {
  name: string;
  employment: string;
  salary: number | null;
  goal: string | null;
  savedAt: string;
};

export const employmentOptions = [
  { id: "full-time", label: "Full-time", emoji: "💼" },
  { id: "part-time", label: "Part-time", emoji: "⏰" },
  { id: "self-employed", label: "Self-employed", emoji: "🚀" },
  { id: "student", label: "Student", emoji: "🎓" },
  { id: "between-jobs", label: "Between jobs", emoji: "🌱" },
] as const;

export const goalOptions = [
  { id: "save", label: "Save more", emoji: "🏦" },
  { id: "debt", label: "Pay off debt", emoji: "✂️" },
  { id: "invest", label: "Start investing", emoji: "📈" },
  { id: "credit", label: "Build credit", emoji: "🧱" },
] as const;

export function employmentLabel(id: string | null | undefined) {
  return employmentOptions.find((o) => o.id === id)?.label || null;
}

export function goalLabel(id: string | null | undefined) {
  return goalOptions.find((o) => o.id === id)?.label || null;
}

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    if (!parsed || typeof parsed.name !== "string") return null;
    return {
      name: parsed.name,
      employment: typeof parsed.employment === "string" ? parsed.employment : "full-time",
      salary: typeof parsed.salary === "number" ? parsed.salary : null,
      goal: typeof parsed.goal === "string" ? parsed.goal : null,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveProfile(profile: Omit<UserProfile, "savedAt">) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({ ...profile, savedAt: new Date().toISOString() }),
  );
}
