export interface PerformanceReviewEntity {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string | null;
  periodStart: string;
  periodEnd: string;
  score: number;
  bonusAmount: number;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

function toNumber(value: unknown, fallback: number = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export class PerformanceReviewModel {
  static fromRow(row: any): PerformanceReviewEntity {
    const firstName = row.first_name ?? row.user_first_name ?? '';
    const lastName = row.last_name ?? row.user_last_name ?? '';
    const userName =
      `${firstName} ${lastName}`.trim() || row.user_name || 'Bilinmeyen';
    return {
      id: row.id,
      userId: row.user_id,
      userName,
      userEmail: row.email ?? row.user_email ?? null,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      score: toNumber(row.score, 0),
      bonusAmount: toNumber(row.bonus_amount, 0),
      notes: row.notes ?? null,
      createdBy: row.created_by ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
