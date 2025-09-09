import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);
export const getTimeLeftText = (start, end) => {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  const now = dayjs();

  if (now.isBefore(startDate) || now.isAfter(endDate)) return null;

  const diff = endDate.diff(now);
  const duration = dayjs.duration(diff);
  const days = duration.asDays();
  const hours = duration.asHours();
  const minutes = duration.asMinutes();

  if (days >= 1) {
    const dayCount = Math.round(days);
    return `Sales ends in ${dayCount} day${dayCount !== 1 ? 's' : ''}`;
  } else if (hours >= 1) {
    const hourCount = Math.round(hours);
    return `Sales ends in ${hourCount} hour${hourCount !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    const minuteCount = Math.round(minutes);
    return `Sales ends in ${minuteCount} minute${minuteCount !== 1 ? 's' : ''}`;
  }

  return null;
};