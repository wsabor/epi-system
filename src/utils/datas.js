// "AAAA-MM-DD" como data local. new Date("AAAA-MM-DD") seria meia-noite UTC,
// que no Brasil (UTC-3) cai no dia anterior.
export function dataLocal(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}
