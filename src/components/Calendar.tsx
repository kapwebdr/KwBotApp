import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { CalendarEvent } from '../types/calendar';
import { calendarService } from '../services/calendarService';
import { taskCategoryService } from '../services/taskCategoryService';
import { BottomBar } from './BottomBar';
import { useBottomPadding } from '../hooks/useBottomPadding';
import { LoadingBubble } from './LoadingBubble';
import { AddEventModal } from './AddEventModal';
import { ConfirmationModal } from './ConfirmationModal';
import { TaskCategory } from '../types/tasks';
import { Categories } from './Categories';
import { useTool } from '../hooks/useTool';
import { taskService } from '../services/taskService';

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

type CalendarView = 'month' | 'week' | 'day';

export const Calendar: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const bottomPadding = useBottomPadding();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { setToolHeight } = useTool();

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const loadedEvents = await calendarService.getEventsByDateRange(start, end);
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  const loadCategories = useCallback(async () => {
    try {
      const loadedCategories = await taskCategoryService.listCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  }, []);

  useEffect(() => {
    setToolHeight(0);
    loadEvents();
    loadCategories();
  }, [loadEvents, loadCategories]);

  const handleEventAction = async (event: CalendarEvent) => {
    if (event.taskId) {
      const task = await taskService.getTask(event.taskId);
      if (task) {
        const updatedTask = {
          ...task,
          eventId: event.id
        };
        await taskService.updateTask(updatedTask);
      }
    }
    await loadEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event?.taskId) {
      const task = await taskService.getTask(event.taskId);
      if (task) {
        const updatedTask = {
          ...task,
          eventId: undefined
        };
        await taskService.updateTask(updatedTask);
      }
    }
    await calendarService.deleteEvent(eventId);
    await loadEvents();
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (calendarView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const filteredEvents = useMemo(() => {
    if (!selectedCategory) return events;
    return events.filter(event => event.category?.id === selectedCategory);
  }, [events, selectedCategory]);

  const renderMonthView = () => {
    const days = getDaysInMonth();
    
    return (
      <View style={styles.monthView}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => navigatePeriod('prev')}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: theme.colors.text }]}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => navigatePeriod('next')}>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.weekDaysRow}>
          {DAYS.map((day, index) => (
            <Text key={index} style={[styles.weekDayText, { color: theme.colors.text }]}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.monthGrid}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !day.date && styles.otherMonthDay,
                day.date?.toDateString() === new Date().toDateString() && styles.today,
                selectedDate && day.date?.toDateString() === selectedDate.toDateString() && styles.selectedDay
              ]}
              onPress={() => day.date && setSelectedDate(day.date)}
              disabled={!day.date}
            >
              {day.date && (
                <>
                  <Text style={[styles.dayNumber, { color: theme.colors.text }]}>
                    {day.date.getDate()}
                  </Text>
                  <View style={styles.eventsList}>
                    {filteredEvents
                      .filter(event => new Date(event.startDate).toDateString() === day.date?.toDateString())
                      .slice(0, 3)
                      .map((event, eventIndex) => (
                        <TouchableOpacity
                          key={eventIndex}
                          style={[
                            styles.eventItem,
                            { backgroundColor: event.category?.color || theme.colors.primary },
                            event.taskId && styles.taskEventItem
                          ]}
                          onPress={() => handleEventClick(event)}
                        >
                          {event.taskId && (
                            <Ionicons name="checkbox" size={12} color={theme.colors.background} />
                          )}
                          <Text style={styles.eventTitle} numberOfLines={1}>
                            {event.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    {filteredEvents.filter(event => new Date(event.startDate).toDateString() === day.date?.toDateString()).length > 3 && (
                      <Text style={styles.moreEvents}>
                        +{filteredEvents.filter(event => new Date(event.startDate).toDateString() === day.date?.toDateString()).length - 3}
                      </Text>
                    )}
                  </View>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <View style={styles.weekView}>
        <View style={styles.weekHeader}>
          <TouchableOpacity onPress={() => navigatePeriod('prev')}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.weekTitle, { color: theme.colors.text }]}>
            {weekDays[0].date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigatePeriod('next')}>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.weekDayHeaders}>
          {weekDays.map(({ date }, index) => (
            <View key={index} style={styles.weekDayHeader}>
              <Text style={[styles.weekDayName, { color: theme.colors.text }]}>
                {DAYS[date.getDay()]}
              </Text>
              <Text style={[styles.weekDayNumber, { color: theme.colors.text }]}>
                {date.getDate()}
              </Text>
            </View>
          ))}
        </View>
        <ScrollView style={styles.weekEventsContainer}>
          <View style={styles.weekEventsGrid}>
            {weekDays.map(({ date, events: dayEvents }) => (
              <View key={date.toISOString()} style={styles.weekDayColumn}>
                {dayEvents
                  .filter(event => !selectedCategory || event.category?.id === selectedCategory)
                  .map((event, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.weekEventItem,
                        { backgroundColor: event.category?.color || theme.colors.primary }
                      ]}
                      onPress={() => handleEventClick(event)}
                    >
                      <Text style={styles.weekEventTime}>
                        {new Date(event.startDate).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                      <Text style={styles.weekEventTitle} numberOfLines={2}>
                        {event.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDayView = () => {
    const dayEvents = getDayEvents();
    
    return (
      <View style={styles.dayView}>
        <View style={styles.dayHeader}>
          <TouchableOpacity onPress={() => navigatePeriod('prev')}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.dayTitle, { color: theme.colors.text }]}>
            {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <TouchableOpacity onPress={() => navigatePeriod('next')}>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.dayEventsContainer}>
          {dayEvents
            .filter(event => !selectedCategory || event.category?.id === selectedCategory)
            .map((event, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayEventItem,
                  { backgroundColor: event.category?.color || theme.colors.primary }
                ]}
                onPress={() => handleEventClick(event)}
              >
                <View style={styles.dayEventTime}>
                  <Text style={styles.dayEventTimeText}>
                    {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {!event.allDay && (
                    <Text style={styles.dayEventTimeText}>
                      {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </View>
                <View style={styles.dayEventContent}>
                  <Text style={styles.dayEventTitle}>{event.title}</Text>
                  {event.description && (
                    <Text style={styles.dayEventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                  )}
                  {event.location && (
                    <Text style={styles.dayEventLocation}>
                      <Ionicons name="location" size={12} /> {event.location}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    );
  };

  const renderCalendarView = () => {
    switch (calendarView) {
      case 'month':
        return renderMonthView();
      case 'week':
        return renderWeekView();
      case 'day':
        return renderDayView();
      default:
        return renderMonthView();
    }
  };

  const getDaysInMonth = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: Array<{ date: Date | null; events: CalendarEvent[] }> = [];

    // Jours du mois précédent
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: null, events: [] });
    }

    // Jours du mois en cours
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.getDate() === i &&
               eventDate.getMonth() === month &&
               eventDate.getFullYear() === year;
      });
      days.push({ date, events: dayEvents });
    }

    // Compléter la dernière semaine
    while (days.length % 7 !== 0) {
      days.push({ date: null, events: [] });
    }

    return days;
  }, [currentDate, events]);

  const getWeekDays = useCallback(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days: Array<{ date: Date; events: CalendarEvent[] }> = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === date.toDateString();
      });

      days.push({ date, events: dayEvents });
    }

    return days;
  }, [currentDate, events]);

  const getDayEvents = useCallback(() => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === currentDate.toDateString();
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [currentDate, events]);

  if (isLoading) {
    return (
      <View style={styles.calendarContainer}>
        <LoadingBubble message="Chargement du calendrier..." />
      </View>
    );
  }

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <View style={styles.viewSelector}>
          <TouchableOpacity
            style={[styles.viewButton, calendarView === 'month' && styles.viewButtonActive]}
            onPress={() => setCalendarView('month')}
          >
            <Text style={styles.viewButtonText}>Mois</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, calendarView === 'week' && styles.viewButtonActive]}
            onPress={() => setCalendarView('week')}
          >
            <Text style={styles.viewButtonText}>Semaine</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, calendarView === 'day' && styles.viewButtonActive]}
            onPress={() => setCalendarView('day')}
          >
            <Text style={styles.viewButtonText}>Jour</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddEvent}
        >
          <Ionicons name="add" size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>

      <Categories
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        showManageButton={true}
        onUpdate={loadCategories}
      />

      <View style={[styles.calendarContent, { marginBottom: bottomPadding }]}>
          {renderCalendarView()}
      </View>

      <AddEventModal
        isVisible={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        onAdd={handleEventAction}
        selectedDate={selectedDate}
        categories={categories}
        event={selectedEvent}
        selectedCategory={selectedCategory}
      />

      <ConfirmationModal
        isVisible={showDeleteModal}
        onConfirm={handleDeleteEvent}
        onCancel={() => setShowDeleteModal(false)}
        title="Supprimer l'événement"
        message="Êtes-vous sûr de vouloir supprimer cet événement ?"
        type="danger"
        icon="trash"
      />

      <BottomBar />
    </View>
  );
};

export default Calendar; 