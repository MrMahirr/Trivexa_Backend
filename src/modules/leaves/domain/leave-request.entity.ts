import { LeaveStatus, LeaveType } from './leave.enums';

const TYPE_NORMALIZATION: Record<string, LeaveType> = {
  YILLIK: LeaveType.YILLIK,
  YILLIK_IZIN: LeaveType.YILLIK,
  ANNUAL: LeaveType.YILLIK,
  YEARLY: LeaveType.YILLIK,
  MAZERET: LeaveType.MAZERET,
  RAPOR: LeaveType.RAPOR,
  UCRETSIZ: LeaveType.UCRETSIZ,
  DIGER: LeaveType.DIGER,
};

function normalizeLeaveType(value: unknown): LeaveType {
  const key = String(value ?? '').trim().toUpperCase();
  return TYPE_NORMALIZATION[key] ?? LeaveType.DIGER;
}

export interface LeaveRequestEntity {
  id: string;
  userId: string;
  employeeName: string;
  employeeEmail?: string | null;
  department: string | null;
  type: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export class LeaveRequestModel {
  static fromRow(row: any): LeaveRequestEntity {
    const employeeName = [row.first_name, row.last_name].filter(Boolean).join(' ').trim();
    return {
      id: row.id,
      userId: row.user_id,
      employeeName: employeeName || row.employee_name || 'Bilinmeyen',
      employeeEmail: row.email ?? row.employee_email ?? null,
      department: row.department ?? null,
      type: normalizeLeaveType(row.type),
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      durationDays: row.duration_days,
      reason: row.reason ?? null,
      approvedBy: row.approved_by ?? null,
      approvedAt: row.approved_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
