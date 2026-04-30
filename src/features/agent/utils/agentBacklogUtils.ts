import type { AiSuggestionStatus, AiTaskSuggestion } from "@/features/agent/types/aiBacklog";

export interface AiSuggestionColumn {
  status: AiSuggestionStatus;
  label: string;
  accent: string;
  headerBg: string;
  headerBorder: string;
  countBg: string;
  countColor: string;
}

export const AI_SUGGESTION_COLUMNS: AiSuggestionColumn[] = [
  {
    status: "PENDING",
    label: "Pending",
    accent: "#D97706",
    headerBg: "#FFFBEB",
    headerBorder: "#FDE68A",
    countBg: "#FCD34D",
    countColor: "#78350F",
  },
  {
    status: "APPROVED",
    label: "Aceptadas",
    accent: "#16A34A",
    headerBg: "#F0FDF4",
    headerBorder: "#BBF7D0",
    countBg: "#BBF7D0",
    countColor: "#14532D",
  },
  {
    status: "REJECTED",
    label: "Rechazadas",
    accent: "#DC2626",
    headerBg: "#FEF2F2",
    headerBorder: "#FECACA",
    countBg: "#FECACA",
    countColor: "#991B1B",
  },
];

export const EMPTY_SUGGESTIONS: AiTaskSuggestion[] = [];

export const sortSuggestions = (list: AiTaskSuggestion[]) =>
  [...list].sort((a, b) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();
    return da - db;
  });

const pad = (n: number) => String(n).padStart(2, "0");

export const toLocalDateTimeInputValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
  `T${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const getDefaultFechaLimite = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(17, 0, 0, 0);
  return toLocalDateTimeInputValue(d);
};

export const getMinFechaLimite = () => toLocalDateTimeInputValue(new Date());
