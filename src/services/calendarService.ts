import { CalendarEvent } from '../types/calendar';
import { storageService } from './storageService';
import { notificationService } from './notificationService';
import { StorageResponse } from '../types/storage';
class CalendarService {
  private readonly COLLECTION = 'events';

  async listEvents(): Promise<CalendarEvent[]> {
    try {
      const keys = await storageService.list(this.COLLECTION);
      const events = await Promise.all(
        keys.map(async (key) => {
          const event = await storageService.get(this.COLLECTION, key);
          return { ...event, id: key };
        })
      );
      return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      return [];
    }
  }

  async addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<StorageResponse> {
    try {
      const now = new Date().toISOString();
      const newEvent: CalendarEvent = {
        ...event,
        id: `event_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };

      const success = await storageService.set({
        key: newEvent.id,
        value: newEvent,
        collection: this.COLLECTION,
      });

      if (success.status === 'success') {
        notificationService.notify('success', 'Événement ajouté avec succès');
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'événement:', error);
      notificationService.notify('error', 'Erreur lors de l\'ajout de l\'événement');
      return { status: 'error', key: '' };
    }
  }

  async updateEvent(event: CalendarEvent): Promise<StorageResponse> {
    try {
      const success = await storageService.set({
        key: event.id,
        value: event,
        collection: this.COLLECTION,
      });

      if (success.status === 'success') {
        notificationService.notify('success', 'Événement mis à jour avec succès');
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error);
      notificationService.notify('error', 'Erreur lors de la mise à jour de l\'événement');
      return { status: 'error', key: '' };
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const success = await storageService.delete(this.COLLECTION, eventId);
      if (success) {
        notificationService.notify('success', 'Événement supprimé avec succès');
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
      notificationService.notify('error', 'Erreur lors de la suppression de l\'événement');
      return false;
    }
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const allEvents = await this.listEvents();
      return allEvents.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return eventStart >= startDate && eventEnd <= endDate;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des événements par date:', error);
      return [];
    }
  }
}

export const calendarService = new CalendarService(); 