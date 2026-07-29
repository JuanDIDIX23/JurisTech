import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Input } from '@shared/ui';
import { ModalBase } from './ModalBase';

export type TokensAccion = 'recarga' | 'consumo';

interface TokensModalProps {
  open: boolean;
  accion: TokensAccion;
  /** saldo actual, para validar el consumo antes de llamar al servidor */
  disponibles: number;
  /** texto sugerido en el campo descripción */
  descripcionInicial?: string;
  onClose: () => void;
  onConfirmar: (cantidad: number, descripcion: string) => Promise<void>;
}

export function TokensModal({
  open,
  accion,
  disponibles,
  descripcionInicial = '',
  onClose,
  onConfirmar,
}: TokensModalProps) {
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCantidad('');
      setDescripcion(descripcionInicial);
      setError(null);
    }
  }, [open, descripcionInicial]);

  const esRecarga = accion === 'recarga';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;

    const n = Number(cantidad);
    if (!Number.isInteger(n) || n <= 0) {
      setError('Introduce una cantidad entera mayor que cero.');
      return;
    }
    if (!esRecarga && n > disponibles) {
      setError(`El afiliado solo tiene ${disponibles} tokens disponibles.`);
      return;
    }

    setError(null);
    setEnviando(true);
    try {
      await onConfirmar(n, descripcion);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el movimiento.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ModalBase
      open={open}
      titulo={esRecarga ? 'Recargar tokens' : 'Consumir tokens'}
      descripcion={
        esRecarga
          ? 'Se sumarán al saldo del afiliado y quedará registro del movimiento.'
          : `Se descontarán del saldo. Disponibles: ${disponibles}.`
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Cantidad de tokens</span>
          <Input
            className="mt-1.5"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            disabled={enviando}
            autoFocus
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Descripción</span>
          <Input
            className="mt-1.5"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            disabled={enviando}
            placeholder={esRecarga ? 'Ej. Recarga mensual del plan' : 'Ej. Revisión de contrato'}
          />
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Registrando…' : esRecarga ? 'Recargar' : 'Consumir'}
          </Button>
        </div>
      </form>
    </ModalBase>
  );
}
