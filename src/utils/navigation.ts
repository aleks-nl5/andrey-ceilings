/**
 * Утилиты для построения ссылок на навигаторы (Google Карты, Waze, Яндекс Карты)
 */

export function getGoogleMapsUrl(address: string): string {
  const query = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function getWazeUrl(address: string): string {
  const query = encodeURIComponent(address);
  return `https://waze.com/ul?q=${query}&navigate=yes`;
}

export function getYandexMapsUrl(address: string): string {
  const query = encodeURIComponent(address);
  return `https://yandex.ru/maps/?text=${query}`;
}

export function openInNavigator(address: string, app: 'google' | 'waze' | 'yandex' = 'google'): void {
  let url = getGoogleMapsUrl(address);
  if (app === 'waze') url = getWazeUrl(address);
  if (app === 'yandex') url = getYandexMapsUrl(address);

  window.open(url, '_blank', 'noopener,noreferrer');
}
