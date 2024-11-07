import { NotificationType } from '../types/notifications';

class NotificationService {
  private static instance: NotificationService;
  private notifyFn?: (type: NotificationType, message: string, isPermanent: boolean) => void;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public init(notifyFn: (type: NotificationType, message: string, isPermanent: boolean) => void) {
    this.notifyFn = notifyFn;
  }

  public notify(type: NotificationType, message: string, isPermanent: boolean = false) {
    if (this.notifyFn) {
      this.notifyFn(type, message, isPermanent);
    }
  }
}

export const notificationService = NotificationService.getInstance(); 