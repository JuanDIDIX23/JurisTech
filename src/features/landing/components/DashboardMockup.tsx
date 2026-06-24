import { motion } from 'framer-motion';
import { Coins, FileText, LayoutGrid, ArrowUpRight, Activity } from 'lucide-react';

// Mockup estático del dashboard para el hero. No usa datos reales del store:
// es una pieza visual autocontenida y ligera.

const bars = [38, 52, 44, 66, 58, 78, 70, 88];

export function DashboardMockup() {
  return (
    <div className="relative">
      {/* halo */}
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent-500/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-navy-900 shadow-[0_40px_120px_-30px_rgba(7,13,28,0.8)]"
      >
        {/* topbar de la ventana */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-navy-950/60 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <div className="ml-3 h-5 flex-1 rounded-md bg-white/5" />
        </div>

        <div className="grid grid-cols-12">
          {/* sidebar */}
          <aside className="col-span-3 hidden flex-col gap-1 border-r border-white/5 p-3 sm:flex">
            {[LayoutGrid, FileText, Coins, Activity].map((Icon, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${
                  i === 0 ? 'bg-accent-500/15 text-accent-200' : 'text-graphite-400'
                }`}
              >
                <Icon size={15} />
                <span className="h-2 w-14 rounded-full bg-current opacity-40" />
              </div>
            ))}
          </aside>

          {/* contenido */}
          <main className="col-span-12 space-y-4 p-4 sm:col-span-9">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Tokens disp.', value: '182', tone: 'text-accent-300' },
                { label: 'Consumidos', value: '318', tone: 'text-white' },
                { label: 'Activas', value: '3', tone: 'text-white' },
              ].map((c) => (
                <div key={c.label} className="rounded-xl border border-white/5 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-graphite-400">{c.label}</p>
                  <p className={`mt-1 text-lg font-semibold ${c.tone}`}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* gráfico */}
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="h-2.5 w-24 rounded-full bg-white/15" />
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300">
                  <ArrowUpRight size={12} /> +12,4%
                </span>
              </div>
              <div className="flex h-24 items-end gap-2">
                {bars.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                    className={`flex-1 rounded-md ${
                      i === bars.length - 1
                        ? 'bg-gradient-to-t from-accent-500 to-accent-300'
                        : 'bg-white/15'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* lista documentos */}
            <div className="space-y-2">
              {['Contrato de servicios', 'Dictamen laboral', 'Informe RGPD'].map((d, i) => (
                <div
                  key={d}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-500/15 text-accent-200">
                      <FileText size={13} />
                    </span>
                    <span className="text-xs text-graphite-200">{d}</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      i === 2 ? 'bg-amber-400/15 text-amber-200' : 'bg-emerald-400/15 text-emerald-200'
                    }`}
                  >
                    {i === 2 ? 'En revisión' : 'Listo'}
                  </span>
                </div>
              ))}
            </div>
          </main>
        </div>
      </motion.div>

      {/* tarjeta flotante */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-xl border border-graphite-200 bg-white px-4 py-3 shadow-card lg:flex"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
          <Coins size={17} />
        </span>
        <div>
          <p className="text-xs font-semibold text-navy-900">182 tokens disponibles</p>
          <p className="text-[11px] text-graphite-500">Renovación el 15 jul</p>
        </div>
      </motion.div>
    </div>
  );
}
