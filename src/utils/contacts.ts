import { Client, ObjectProject } from '../types/database';

/**
 * Создает vCard (VCF 3.0) строку для клиента.
 * При открытии на Android система предлагает импортировать контакт
 * в адресную книгу телефона, после чего при входящем звонке будет видно имя клиента!
 */
export function generateVCard(client: Client, objects?: ObjectProject[]): string {
  const cleanPhone = client.phone.trim();
  const clientObjects = objects?.filter((o) => o.clientId === client.id) || [];
  const objectsSummary = clientObjects.map((o) => `${o.address} (${o.roomType})`).join('; ');

  const note = [
    'Клиент: Натяжные потолки (ПотолокПро)',
    client.notes ? `Заметка: ${client.notes}` : '',
    objectsSummary ? `Объекты: ${objectsSummary}` : '',
  ]
    .filter(Boolean)
    .join(' \\n');

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${client.name}`,
    `N:${client.name};;;;`,
    `TEL;TYPE=CELL,VOICE:${cleanPhone}`,
    client.email ? `EMAIL;TYPE=INTERNET:${client.email}` : '',
    client.address ? `ADR;TYPE=HOME:;;${client.address};;;;` : '',
    `NOTE:${note}`,
    'ORG:Заказчик натяжных потолков',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');

  return vcard;
}

/**
 * Скачивает vCard файл или вызывает системный диалог добавления контакта
 */
export function exportClientToContacts(client: Client, objects?: ObjectProject[]): void {
  const vcard = generateVCard(client, objects);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const safeName = client.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_');
  link.download = `${safeName}_contact.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Экспорт всех клиентов в один общий VCF файл для импорта в Android контакты
 */
export function exportAllClientsToContacts(clients: Client[], objects?: ObjectProject[]): void {
  const allCards = clients.map((c) => generateVCard(c, objects)).join('\r\n');
  const blob = new Blob([allCards], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `potolok_pro_all_clients_${new Date().toISOString().split('T')[0]}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
