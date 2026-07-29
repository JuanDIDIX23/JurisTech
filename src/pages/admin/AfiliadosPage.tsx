import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Coins, ChevronRight, Pause, Play } from 'lucide-react';
import { Badge, Button, Card, Input, Select } from '@shared/ui';
import { NuevoAfiliadoModal } from '@features/admin/components/NuevoAfiliadoModal';
import { TokensModal } from '@features/admin/components/TokensModal';
import {
  actualizarEstadoAfiliado,
  asignarPlan,
  getAfiliados,
  getPlanes,
  recargarTokens,
} from '@shared/services/admin-afiliados';
import { AFILIADO_ESTADO_LABELS, AFILIADO_ESTADO_TONE } from '@shared/constants/labels';
import { formatNumber } from '@shared/lib/format';
import { ROUTES } from '@app/routes';
import { cn } from '@shared/lib/cn';
import type { Afiliado, Plan } from '@shared/types/supabase';

export default function AfiliadosPage() {
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [modalNuevo, setModalNuevo] = useState(false);
  const [recargando, setRecargando] = useState<Afiliado | null>(null);
  const [actualizando, setActualizando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lista, listaPlanes] = await Promise.all([getAfiliados(), getPlanes()]);
      setAfiliados(lista);
      setPlanes(listaPlanes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los afiliados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return afiliados;
    return afiliados.filter((a) => {
      const campos = [a.profile?.nombre, a.profile?.empresa]
        .filter((v): v is string => typeof v === 'string')
        .join(' ')
        .toLowerCase();
      return campos.includes(texto);
    });
  }, [afiliados, busqueda]);

  async function cambiarPlan(afiliado: Afiliado, planId: string) {
    setActualizando(afiliado.id);
    const previo = afiliado.plan_id;
    const nuevoPlan = planes.find((p) => p.id === planId) ?? null;
    setAfiliados((actuales) =>
      actuales.map((a) => (a.id === afiliado.id ? { ...a, plan_id: planId, plan: nuevoPlan } : a)),
    );
    try {
      await asignarPlan(afiliado.id, planId);
    } catch (err) {
      setAfiliados((actuales) =>
        actuales.map((a) =>
          a.id === afiliado.id ? { ...a, plan_id: previo, plan: afiliado.plan } : a,
        ),
      );
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el plan.');
    } finally {
      setActualizando(null);
    }
  }

  async function alternarEstado(afiliado: Afiliado) {
    const nuevo = afiliado.estado === 'activo' ? 'suspendido' : 'activo';
    setActualizando(afiliado.id);
    const previo = afiliado.estado;
    setAfiliados((actuales) =>
      actuales.map((a) => (a.id === afiliado.id ? { ...a, estado: nuevo } : a)),
    );
    try {
      await actualizarEstadoAfiliado(afiliado.id, nuevo);
    } catch (err) {
      setAfiliados((actuales) =>
        actuales.map((a) => (a.id === afiliado.id ? { ...a, estado: previo } : a)),
      );
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado.');
    } finally {
      setActualizando(null);
    }
  }

  async function confirmarRecarga(cantidad: number, descripcion: string) {
    if (!recargando) return;
    await recargarTokens(recargando.id, cantidad, descripcion);
    setAfiliados((actuales) =>
      actuales.map((a) =>
        a.id === recargando.id
          ? { ...a, tokens_disponibles: a.tokens_disponibles + cantidad }
          : a,
      ),
    );
  }

  const opcionesPlan = planes.map((p) => ({ value: p.id, label: p.nombre }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-stone-900">
            Afiliados
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {filtrados.length} de {afiliados.length} registros
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setModalNuevo(true)}>
          Nuevo afiliado
        </Button>
      </div>

      <Card className="mt-6 p-4">
        <div className="sm:max-w-md">
          <Input
            placeholder="Buscar por nombre o empresa…"
            leftIcon={<Search size={16} />}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </Card>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}

      <Card className="mt-4 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-200 border-t-brand-500" />
          </div>
        ) : filtrados.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-stone-400">
            {afiliados.length === 0
              ? 'Todavía no hay afiliados. Crea el primero desde “Nuevo afiliado”.'
              : 'Ningún afiliado coincide con la búsqueda.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-sand-200 bg-sand-50 text-xs uppercase tracking-widest text-stone-500">
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Empresa</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Tokens</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Inicio</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((a) => {
                  const bloqueado = actualizando === a.id;
                  return (
                    <tr key={a.id} className="border-b border-sand-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-stone-900">
                        <Link
                          to={ROUTES.adminAfiliadoDetalle(a.id)}
                          className="hover:text-brand-700"
                        >
                          {a.profile?.nombre ?? 'Sin nombre'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{a.profile?.empresa ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Select
                          options={
                            opcionesPlan.length > 0
                              ? opcionesPlan
                              : [{ value: '', label: 'Sin planes' }]
                          }
                          value={a.plan_id ?? ''}
                          disabled={bloqueado}
                          onChange={(e) => void cambiarPlan(a, e.target.value)}
                          aria-label={`Plan de ${a.profile?.nombre ?? 'afiliado'}`}
                          className={cn('h-9 text-xs', bloqueado && 'opacity-50')}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold tabular-nums text-stone-900">
                          {formatNumber(a.tokens_disponibles)}
                        </span>
                        <span className="ml-1 text-xs text-stone-500">
                          / {formatNumber(a.plan?.tokens_incluidos ?? 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={AFILIADO_ESTADO_TONE[a.estado]} dot>
                          {AFILIADO_ESTADO_LABELS[a.estado]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-stone-500">{a.fecha_inicio}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setRecargando(a)}
                            title="Recargar tokens"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-600 transition-colors hover:bg-brand-50"
                          >
                            <Coins size={15} />
                          </button>
                          <button
                            onClick={() => void alternarEstado(a)}
                            disabled={bloqueado || a.estado === 'cancelado'}
                            title={a.estado === 'activo' ? 'Suspender' : 'Activar'}
                            className={cn(
                              'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30',
                              a.estado === 'activo'
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50',
                            )}
                          >
                            {a.estado === 'activo' ? <Pause size={15} /> : <Play size={15} />}
                          </button>
                          <Link
                            to={ROUTES.adminAfiliadoDetalle(a.id)}
                            title="Ver detalle"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-sand-100 hover:text-stone-700"
                          >
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <NuevoAfiliadoModal
        open={modalNuevo}
        onClose={() => setModalNuevo(false)}
        onCreado={() => void cargar()}
      />

      <TokensModal
        open={recargando !== null}
        accion="recarga"
        disponibles={recargando?.tokens_disponibles ?? 0}
        onClose={() => setRecargando(null)}
        onConfirmar={confirmarRecarga}
      />
    </div>
  );
}
