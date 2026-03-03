export class Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }
}
