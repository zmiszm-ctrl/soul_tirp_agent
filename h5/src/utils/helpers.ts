export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date: Date): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const day = days[date.getDay()];
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${hour}:${minute}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

export function getDirectionText(direction: string): string {
  const map: Record<string, string> = {
    east: '东行',
    south: '南下',
    west: '西去',
    north: '北往',
    any: '四方',
  };
  return map[direction] || direction;
}

export function getStyleText(style: string): string {
  const map: Record<string, string> = {
    relax: '放空指南',
    explore: '山野探索',
    slow: '慢城漫游',
    nature: '听风看云',
  };
  return map[style] || style;
}

export function getTimeText(time: string): string {
  const map: Record<string, string> = {
    now: '现在就走',
    afternoon: '午后出发',
    tomorrow: '明天清晨',
  };
  return map[time] || time;
}
