export const MEXICAN_STATES = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
] as const;

export function normalizeRfc(value: string) {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

export function rfcError(value: string) {
  const rfc = normalizeRfc(value);
  if (!rfc) return "El RFC es necesario para cruzar facturas.";
  if (rfc.length !== 12 && rfc.length !== 13) {
    return "El RFC debe tener 12 caracteres (persona moral) o 13 (persona física).";
  }
  if (!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(rfc)) {
    return "Revisa el RFC: letras, fecha (AAMMDD) y homoclave.";
  }
  return null;
}
