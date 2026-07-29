import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Input, Select } from '@shared/ui';
import { ModalBase } from './ModalBase';
import {
  crearAfiliado,
  getPlanes,
  getProfilesSinAfiliar,
  recargarTokens,
} from '@shared/services/admin-afiliados';
import type { Plan } from '@shared/types/supabase';

interface PerfilLibre {
  id: string;
  nombre: string | null;
  empresa: string | null;
}

interface NuevoAfiliadoModalProps {
  open: boolean;
  onClose: () => void;
  onCreado: () => void;
}

export function NuevoAfiliadoModal({ open, onClose, onCreado }: NuevoAfiliadoModalProps) {
  const [perfiles, setPerfiles] = useState<PerfilLibre[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargando, setCargando] = useState(true);

  const [profileId, setProfileId] = useState('');
  const [planId, setPlanId] = useState('');
  const [tokens, setTokens] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelado = false;

    setCargando(true);
    setError(null);
    setProfileId('');
    setPlanId('');
    setTokens('');

    void Promise.all([getProfilesSinAfiliar(), getPlanes()])
      .then(([p, pl]) => {
        if (cancelado) return;
        setPerfiles(p);
        setPlanes(pl);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos.');
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [open]);

  // Al elegir plan se propone su cupo de tokens como valor inicial.
  function handlePlan(id: string) {
    setPlanId(id);
    const plan = planes.find((p) => p.id === id);
    if (plan) setTokens(String(plan.tokens_incluidos));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;

    if (!profileId) {
      setError('Selecciona el usuario que quieres afiliar.');
      return;
    }
    if (!planId) {
      setError('Selecciona un plan.');
      return;
    }
    const n = Number(tokens || 0);
    if (!Number.isInteger(n) || n < 0) {
      setError('Los tokens iniciales deben ser un número entero.');
      return;
    }

    setError(null);
    setEnviando(true);
    try {
      await crearAfiliado(profileId, planId);
      // Los tokens se asignan como movimiento, no escribiendo el saldo:
      // así queda trazabilidad desde el primer día.
      if (n > 0) {
        await recargarTokens(profileId, n, 'Tokens iniciales del plan');
      }
      onCreado();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el afiliado.');
    } finally {
      setEnviando(false);
    }
  }

  const opcionesPerfil = [
    { value: '', label: cargando ? 'Cargando usuarios…' : 'Selecciona un usuario' },
    ...perfiles.map((p) => ({
      value: p.id,
      label: `${p.nombre ?? 'Sin nombre'}${p.empresa ? ` · ${p.empresa}` : ''}`,
    })),
  ];

  const opcionesPlan = [
    { value: '', label: 'Selecciona un plan' },
    ...planes.map((p) => ({ value: p.id, label: `${p.nombre} (${p.tokens_incluidos} tokens)` })),
  ];

  return (
    <ModalBase
      open={open}
      titulo="Nuevo afiliado"
      descripcion="Vincula un usuario ya registrado a un plan."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Usuario registrado</span>
          <Select
            className="mt-1.5"
            options={opcionesPerfil}
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            disabled={enviando || cargando}
            required
          />
          {!cargando && perfiles.length === 0 && (
            <span className="mt-1.5 block text-xs text-stone-500">
              Todos los usuarios registrados ya tienen ficha de afiliado.
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Plan</span>
          <Select
            className="mt-1.5"
            options={opcionesPlan}
            value={planId}
            onChange={(e) => handlePlan(e.target.value)}
            disabled={enviando || cargando}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Tokens iniciales</span>
          <Input
            className="mt-1.5"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={tokens}
            onChange={(e) => setTokens(e.target.value)}
            disabled={enviando}
          />
          <span className="mt-1.5 block text-xs text-stone-500">
            Se registran como una recarga, así aparecen en el historial del afiliado.
          </span>
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
          <Button type="submit" disabled={enviando || cargando || perfiles.length === 0}>
            {enviando ? 'Creando…' : 'Crear afiliado'}
          </Button>
        </div>
      </form>
    </ModalBase>
  );
}
