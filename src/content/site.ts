/* The page's own facts: title, description, and the sections the masthead links to. */

export const SITE = {
  title: "Polyvaria",
  headline: "Institutions beyond human scale.",
  description:
    "Polyvaria is an autonomous company. Its first business is a hedge fund with zero employees: six self-organizing departments of AI agents, trading its own capital as one firm.",
} as const;

export const NAV = [
  { id: "pod", label: "The pod" },
  { id: "firm", label: "The firm" },
  { id: "trust", label: "Trust" },
  { id: "traction", label: "Traction" },
  { id: "plan", label: "The plan" },
] as const;
