import { Theme } from '../../types/themes';
import { ViewStyle, TextStyle } from 'react-native';

export const createCalendarStyles = (theme: Theme) => ({
  calendarContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  calendarHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  viewSelector: {
    flexDirection: 'row' as const,
    backgroundColor: theme.colors.gray100,
    borderRadius: 8,
    padding: 4,
  } as ViewStyle,
  viewButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  } as ViewStyle,
  viewButtonActive: {
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  viewButtonText: {
    fontSize: 14,
    color: theme.colors.text,
  } as TextStyle,
  viewButtonTextActive: {
    color: theme.colors.background,
  } as TextStyle,
  addButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  calendarContent: {
    flex: 1,
    position: 'relative',
    overflow: 'auto',
  },
  calendarContentContainer: {
    flexGrow: 1,
  } as ViewStyle,
  monthView: {
    flex: 1,
  } as ViewStyle,
  monthHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  monthTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text,
  } as TextStyle,
  weekDaysRow: {
    flexDirection: 'row' as const,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  weekDayText: {
    flex: 1,
    textAlign: 'center' as const,
    paddingVertical: 8,
    fontSize: 12,
    color: theme.colors.gray400,
  } as TextStyle,
  monthGrid: {
    flex: 1,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  } as ViewStyle,
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  } as ViewStyle,
  otherMonthDay: {
    opacity: 0.3,
  } as ViewStyle,
  today: {
    backgroundColor: `${theme.colors.primary}10`,
  } as ViewStyle,
  selectedDay: {
    backgroundColor: `${theme.colors.primary}20`,
  } as ViewStyle,
  dayNumber: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: theme.colors.text,
    marginBottom: 4,
  } as TextStyle,
  eventsList: {
    flex: 1,
    gap: 2,
  } as ViewStyle,
  eventItem: {
    padding: 4,
    borderRadius: 4,
    marginBottom: 2,
  } as ViewStyle,
  eventTitle: {
    fontSize: 10,
    color: theme.colors.background,
    fontWeight: '500' as const,
  } as TextStyle,
  moreEvents: {
    fontSize: 10,
    color: theme.colors.gray400,
    textAlign: 'center' as const,
  } as TextStyle,
  weekView: {
    flex: 1,
  } as ViewStyle,
  weekHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  weekTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text,
  } as TextStyle,
  weekDayHeaders: {
    flexDirection: 'row' as const,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  weekDayHeader: {
    flex: 1,
    alignItems: 'center' as const,
    padding: 8,
  } as ViewStyle,
  weekDayName: {
    fontSize: 12,
    color: theme.colors.gray400,
  } as TextStyle,
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '500' as const,
  } as TextStyle,
  weekEventsContainer: {
    flex: 1,
  } as ViewStyle,
  weekEventsGrid: {
    flexDirection: 'row' as const,
  } as ViewStyle,
  weekDayColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    padding: 4,
  } as ViewStyle,
  weekEventItem: {
    margin: 1,
    padding: 4,
    borderRadius: 4,
  } as ViewStyle,
  weekEventTime: {
    fontSize: 10,
    color: theme.colors.background,
  } as TextStyle,
  weekEventTitle: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: theme.colors.background,
  } as TextStyle,
  dayView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  dayHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.gray50,
  } as ViewStyle,
  dayTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text,
  } as ViewStyle,
  dayEventsContainer: {
    flex: 1,
    padding: 16,
  } as ViewStyle,
  dayEventItem: {
    flexDirection: 'row' as const,
    backgroundColor: theme.colors.gray100,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden' as const,
  } as ViewStyle,
  dayEventTime: {
    width: 80,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  } as ViewStyle,
  dayEventTimeText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: theme.colors.text,
    textAlign: 'center' as const,
  } as TextStyle,
  dayEventContent: {
    flex: 1,
    padding: 12,
  } as ViewStyle,
  dayEventTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: 4,
  } as TextStyle,
  dayEventDescription: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  } as TextStyle,
  dayEventLocation: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  } as TextStyle,
  dayEventCategory: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  } as ViewStyle,
  dayNoEvents: {
    padding: 20,
    alignItems: 'center' as const,
  } as ViewStyle,
  dayNoEventsText: {
    fontSize: 16,
    color: theme.colors.gray400,
    textAlign: 'center' as const,
  } as TextStyle,
  taskEventItem: {
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.background,
  } as ViewStyle,
});
