import { useEffect, useState } from 'react';
import { obtenerContacto } from '@shared/services/config';
import { CONTACT_CONFIG } from '@shared/config/schedule';

export interface ResolvedContact {
  /** número internacional sin símbolos, para wa.me */
  whatsappNumber: string;
  /** número formateado para mostrar */
  whatsappDisplay: string;
  email: string;
}

/** Convierte 573219761348 en «+57 321 976 1348». */
function formatearWhatsapp(numero: string): string {
  const soloDigitos = numero.replace(/\D/g, '');
  const match = soloDigitos.match(/^(57)(\d{3})(\d{3})(\d{4})$/);
  if (!match) return `+${soloDigitos}`;
  const [, pais, a, b, c] = match;
  return `+${pais} ${a} ${b} ${c}`;
}

/**
 * Datos de contacto vigentes. Arranca con el fallback local y lo sustituye
 * por lo guardado en Supabase en cuanto la lectura responde, de modo que la
 * UI nunca queda en blanco si la red falla.
 */
export function useContactConfig(): ResolvedContact {
  const [contacto, setContacto] = useState<ResolvedContact>(CONTACT_CONFIG);

  useEffect(() => {
    let cancelado = false;

    void obtenerContacto().then((remoto) => {
      if (cancelado || !remoto) return;
      setContacto({
        whatsappNumber: remoto.whatsapp,
        whatsappDisplay: formatearWhatsapp(remoto.whatsapp),
        email: remoto.email,
      });
    });

    return () => {
      cancelado = true;
    };
  }, []);

  return contacto;
}
