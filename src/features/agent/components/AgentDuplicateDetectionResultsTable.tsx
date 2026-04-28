import type { DuplicateDetectionResult } from "@/features/agent/types/aiDuplicateDetection";
import styles from "@/features/agent/styles/AgentDuplicateDetectionPage.module.css";

interface AgentDuplicateDetectionResultsTableProps {
  results: DuplicateDetectionResult[];
  deletingTaskId: string | null;
  onDeleteTask: (taskId: string, label: "A" | "B", title: string) => void;
}

const formatSimilarity = (score: number) => `${Math.round(score * 100)}%`;

const similarityToneClass = (score: number) => {
  if (score >= 0.9) return styles.similarityHigh;
  if (score >= 0.82) return styles.similarityMedium;
  return styles.similarityLow;
};

export const AgentDuplicateDetectionResultsTable = ({
  results,
  deletingTaskId,
  onDeleteTask,
}: AgentDuplicateDetectionResultsTableProps) => {
  if (results.length === 0) {
    return <p className={styles.emptyState}>No se encontraron duplicados en esta ejecucion.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Tarea A</th>
          <th>Tarea B</th>
          <th>Similitud</th>
          <th>Motivo</th>
          <th>Eliminar</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) => (
          <tr key={result.resultId}>
            <td className="cell-primary">
              <div className={styles.taskTitle}>{result.taskATitle}</div>
            </td>
            <td className="cell-primary">
              <div className={styles.taskTitle}>{result.taskBTitle}</div>
            </td>
            <td>
              <span
                className={`${styles.similarityBadge} ${similarityToneClass(
                  result.similarityScore
                )}`}
              >
                {formatSimilarity(result.similarityScore)}
              </span>
            </td>
            <td>
              <div className={styles.reasonText}>{result.reason}</div>
            </td>
            <td>
              <div className={styles.deleteGroup}>
                <button
                  type="button"
                  className={styles.deleteButton}
                  disabled={deletingTaskId === result.taskAId}
                  onClick={() => onDeleteTask(result.taskAId, "A", result.taskATitle)}
                  aria-label={`Eliminar tarea A: ${result.taskATitle}`}
                >
                  <img src="/trash.svg" alt="" aria-hidden="true" />
                  <span>A</span>
                </button>
                <button
                  type="button"
                  className={styles.deleteButton}
                  disabled={deletingTaskId === result.taskBId}
                  onClick={() => onDeleteTask(result.taskBId, "B", result.taskBTitle)}
                  aria-label={`Eliminar tarea B: ${result.taskBTitle}`}
                >
                  <img src="/trash.svg" alt="" aria-hidden="true" />
                  <span>B</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
