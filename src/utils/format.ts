import dayjs from 'dayjs';

export const formatDate = (dateStr: string, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(dateStr).format(format);
};

export const formatDateTime = (dateStr: string): string => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm');
};

export const formatRelativeTime = (dateStr: string): string => {
  const now = dayjs();
  const target = dayjs(dateStr);
  const diffMinutes = now.diff(target, 'minute');

  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}小时前`;
  if (diffMinutes < 43200) return `${Math.floor(diffMinutes / 1440)}天前`;
  return formatDate(dateStr);
};

export const formatTimeRange = (start: string, end: string): string => {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  if (startDate.isSame(endDate, 'day')) {
    return `${startDate.format('MM月DD日 HH:mm')} - ${endDate.format('HH:mm')}`;
  }
  return `${startDate.format('MM月DD日 HH:mm')} - ${endDate.format('MM月DD日 HH:mm')}`;
};

export const isValidDate = (dateStr: string): boolean => {
  return dayjs(dateStr).isValid();
};

export const isExpired = (dateStr: string): boolean => {
  return dayjs(dateStr).isBefore(dayjs());
};

export const daysRemaining = (dateStr: string): number => {
  return dayjs(dateStr).diff(dayjs(), 'day');
};
