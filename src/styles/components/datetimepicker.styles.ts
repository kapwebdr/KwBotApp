import { Theme } from '../../types/themes';
import { ViewStyle, TextStyle } from 'react-native';

export const createDateTimePickerStyles = (theme: Theme) => ({
  dateTimePickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  } as ViewStyle,

  dateTimePickerContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  } as ViewStyle,

  dateTimePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,

  dateTimePickerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
  } as TextStyle,

  dateTimePickerBody: {
    flexDirection: 'column',
  } as ViewStyle,

  calendarSection: {
    marginBottom: 16,
  } as ViewStyle,

  monthYearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  monthYearText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  } as TextStyle,

  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  } as ViewStyle,

  dayLabel: {
    width: '14.28%',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 12,
    color: theme.colors.gray400,
  } as TextStyle,

  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  selectedDayButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  } as ViewStyle,

  dayButtonText: {
    fontSize: 14,
    color: theme.colors.text,
  } as TextStyle,

  timeSection: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  } as ViewStyle,

  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  } as TextStyle,

  timeSelector: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: theme.colors.gray100,
    borderRadius: 8,
    padding: 8,
  } as ViewStyle,

  timeColumn: {
    alignItems: 'center' as const,
    width: 60,
  } as ViewStyle,

  timeValue: {
    fontSize: 24,
    fontWeight: '500' as const,
    color: theme.colors.text,
    marginVertical: 8,
  } as TextStyle,

  timeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.gray200,
    width: 36,
    height: 36,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginVertical: 4,
  } as ViewStyle,

  timeButtonActive: {
    backgroundColor: theme.colors.primary,
  } as ViewStyle,

  timeSeparator: {
    fontSize: 24,
    fontWeight: '500' as const,
    color: theme.colors.text,
    marginHorizontal: 12,
  } as TextStyle,

  dateTimePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  } as ViewStyle,

  dateTimePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  } as ViewStyle,

  dateTimePickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.background,
  } as TextStyle,
}); 