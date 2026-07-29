// Generación y descarga de CSV en el navegador, sin dependencias.

/** Escapa un valor según RFC 4180 y neutraliza fórmulas de hoja de cálculo. */
function escaparCelda(valor: unknown): string {
  if (valor === null || valor === undefined) return '';
  let texto = String(valor);

  // Un valor que empieza por = + - @ es interpretado como fórmula por Excel
  // y Sheets. Como el contenido viene de un formulario público, se prefija
  // con un apóstrofo para que se trate siempre como texto.
  if (/^[=+\-@\t\r]/.test(texto)) {
    texto = `'${texto}`;
  }

  return `"${texto.replace(/"/g, '""')}"`;
}

export interface ColumnaCSV<T> {
  header: string;
  valor: (fila: T) => unknown;
}

export function generarCSV<T>(filas: T[], columnas: ColumnaCSV<T>[]): string {
  const cabecera = columnas.map((c) => escaparCelda(c.header)).join(',');
  const cuerpo = filas.map((fila) =>
    columnas.map((c) => escaparCelda(c.valor(fila))).join(','),
  );
  return [cabecera, ...cuerpo].join('\r\n');
}

/** Dispara la descarga del CSV. El BOM hace que Excel respete los acentos. */
export function descargarCSV(nombreArchivo: string, contenido: string): void {
  const blob = new Blob([`﻿${contenido}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
