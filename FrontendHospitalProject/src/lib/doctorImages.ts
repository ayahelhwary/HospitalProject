// Original project doctor images (lh3.googleusercontent.com)
const FEMALE_1 = "https://lh3.googleusercontent.com/aida-public/AB6AXuCZwBmBQPqUSBN-uj_lttWbJyCahHpbMDKc9O9JW68ezMlg0rCTKdnmAeeeOIIzd8pf2GRuvJvXOpwXVmk8ocU-W4VTmfgiKQdzzBi9_PiGGhm5MpsFCjyX3ZZpBolln37w0V_lZmIsMv_TCKxUq3aIKpnKsVIdTkQXWQqhogj0arhLp9c49qh4_4TvBTBvlwuFz3UcHYzASoM33pPIcBTRkVHTPj-S37u-A3_9dv29et70em_pYfCgV9kQy3qk6seNeQ-LPIU2EZzq";
const FEMALE_2 = "https://lh3.googleusercontent.com/aida-public/AB6AXuDoda_ygx8DlG-8IrF7IxJGtlOn7r3wautoxZD7dUHwngKli8Pku7XRDxIogI3Osx3O0Yi8T5KT12JyPhzUNsVvnKG4R9qXuVQpOFylhHHNIXt-kfmv-2hfRSPgTngEHCl1mc9qQ3SE-ABouayOBlPjU75l9UpKn_5KOO5TBbyP4xt9csswoD2-bZ7hENLJmAdIWvQCOmddL5h6hyF3IZ2F6prjbLIiWuOdZrKwV_PdJ9UFVcpbFfBSIeJ6qqexomnk6wAKJU4BJr_O";
const MALE   = "https://lh3.googleusercontent.com/aida-public/AB6AXuA6UUaUHP7jAw_RJhm6gCnbR0Iey-baPTbGAgzyd88Lx8gtHjWHPna8eR9PlAT53Kge7bSq4l4uxOFaKK8MC6rbgUp48Qg38HmPLfB8Yy_I7Ie8eTBAZZz97VzwJUw75cj5LpO9GE5RpPrzyhmf0Cvk3dtj_ST9Oo8rCS7XWW8za94y7JzNTmTZjce5re7HPok6TnN-Rbpt6ExcNRRXDmftr7XXY99mkZdwW0wKpZDHP3vz9PuA68ASxPPodabzlyc6C18uCBAUxKYS";

export const DOCTOR_IMAGES: Record<number, string> = {
  1: FEMALE_1, // Sarah Jenkins   — Cardiology
  2: MALE,     // Mark Alistair   — Neurology
  3: FEMALE_2, // Emily Chen      — Pediatrics
  4: MALE,     // James Wilson    — Orthopedics
  5: FEMALE_1, // Olivia Martinez — Dermatology
  6: MALE,     // Robert Fox      — General Surgery
  7: FEMALE_2, // Sarah Jennings  — Ophthalmology
  8: MALE,     // Mark Doe        — Endocrinology
  9: MALE,     // Mohamed Hassan  — Cardiology
};


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5242";

/** Returns avatar_url from API, or the static mapping as fallback */
export function getDoctorImage(id: number, avatarUrl?: string): string {
  if (avatarUrl) {
    return avatarUrl.startsWith("http") ? avatarUrl : `${API_BASE}${avatarUrl}`;
  }
  return DOCTOR_IMAGES[id] || "";
}
