export const getMasterInitials = (masterName?: string, companyName?: string): string => {
  const cleanName = (masterName || '').trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length === 1) {
      return parts[0][0].toUpperCase();
    }
  }
  const cleanCompany = (companyName || '').trim();
  if (cleanCompany) {
    const parts = cleanCompany.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanCompany.slice(0, 2).toUpperCase();
  }
  return 'СП';
};

export const generateEstimateDocNumber = (
  date: Date = new Date(),
  masterName?: string,
  companyName?: string
): string => {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yy}${mm}${dd}`;

  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const timeStr = `${hh}${min}`;

  const initials = getMasterInitials(masterName, companyName).replace(/[^a-zA-Z0-9а-яА-ЯіІїЇєЄ]/g, '') || 'СП';
  return `${dateStr}-${initials}-${timeStr}`;
};
