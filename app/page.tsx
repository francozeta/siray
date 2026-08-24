import Link from "next/link";

function ArrowIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m5 12 4.2 4.2L19 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SirayMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-9 place-items-center rounded-[12px] bg-brand text-surface shadow-[inset_0_0_0_1px_oklch(1_0_0/0.14)]"
    >
      <svg className="size-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M7.4 15.8c2.8 1.7 6.9 1.2 8.7-1.2 1.5-2 .6-4.4-1.4-5.1-2.6-.9-5 .6-6.4 2.8-1.6 2.5-1.1 5.5.4 7.4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M12.2 7.8c.2-1.9 1.1-3.1 2.8-3.8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    </span>
  );
}

const bottlenecks = [
  {
    number: "01",
    title: "La mesa ya decidió",
    copy: "El cliente está listo para pedir, pero tiene que encontrar al personal y esperar su turno.",
  },
  {
    number: "02",
    title: "El equipo transcribe",
    copy: "El staff escucha, anota y vuelve a cargar el pedido mientras atiende otras mesas.",
  },
  {
    number: "03",
    title: "Cocina se entera tarde",
    copy: "La preparación empieza después de varios traspasos que no agregan valor al servicio.",
  },
];

const flow = [
  ["Mesa", "Escanea o acerca"],
  ["Pedido", "Elige y confirma"],
  ["Cocina", "Acepta y prepara"],
  ["Entrega", "Sirve con contexto"],
  ["Cobro", "Usa tu POS actual"],
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      <div className="paper-texture relative">
        <div aria-hidden="true" className="hero-grid absolute inset-0" />
        <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link
            className="flex min-h-11 items-center gap-3 rounded-xl pr-2 font-semibold tracking-[-0.02em]"
            href="/"
          >
            <SirayMark />
            <span translate="no">SIRAY</span>
          </Link>
          <nav aria-label="Navegación principal" className="flex items-center gap-3">
            <a
              className="hidden min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ink-muted hover:text-ink sm:flex"
              href="#como-funciona"
            >
              Cómo funciona
            </a>
            <Link
              className="pressable flex min-h-11 items-center gap-2 rounded-xl bg-brand py-2 pl-4 pr-3.5 text-sm font-semibold text-surface shadow-[0_8px_18px_-10px_oklch(0.25_0.08_151/0.75)] hover:bg-brand-hover"
              href="/t/demo"
            >
              Probar pedido
              <ArrowIcon />
            </Link>
          </nav>
        </header>

        <section className="relative mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-12 lg:pb-28 lg:pt-10">
          <div className="relative z-10 max-w-3xl">
            <p className="reveal mb-6 flex w-fit items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-sm font-semibold text-brand shadow-[inset_0_0_0_1px_oklch(0.36_0.078_151/0.12)]">
              <span className="size-1.5 rounded-full bg-brand" />
              Pedidos desde mesa · Lima, Perú
            </p>
            <h1 className="reveal reveal-delay-1 max-w-[12ch] text-balance font-display text-[clamp(3.3rem,8vw,7.4rem)] font-semibold leading-[0.88] tracking-[-0.055em]">
              Tus clientes piden. Tu equipo avanza.
            </h1>
            <p className="reveal reveal-delay-2 mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-ink-muted sm:text-xl">
              SIRAY lleva el pedido desde la mesa hasta cocina, sin instalar una
              app, crear una cuenta ni reemplazar el POS que ya usas.
            </p>
            <div className="reveal reveal-delay-3 mt-9 flex flex-col items-start gap-3 sm:flex-row">
              <Link
                className="pressable flex min-h-12 items-center gap-2 rounded-[14px] bg-brand py-3 pl-5 pr-[18px] font-semibold text-surface shadow-[0_12px_24px_-14px_oklch(0.25_0.08_151/0.8)] hover:bg-brand-hover"
                href="/t/demo"
              >
                Probar experiencia de mesa
                <ArrowIcon className="size-5" />
              </Link>
              <a
                className="pressable flex min-h-12 items-center rounded-[14px] bg-surface px-5 py-3 font-semibold text-ink shadow-[var(--shadow-card)] hover:bg-surface-strong"
                href="#como-funciona"
              >
                Ver cómo funciona
              </a>
            </div>
            <ul className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-muted">
              {[
                "Sin descargas",
                "Sin cuenta para pedir",
                "Convive con tu POS",
              ].map((item) => (
                <li className="flex items-center gap-2" key={item}>
                  <span className="grid size-5 place-items-center rounded-full bg-brand-soft text-brand">
                    <CheckIcon />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            aria-hidden="true"
            className="reveal reveal-delay-2 relative mx-auto min-h-[510px] w-full max-w-[620px] lg:min-h-[650px]"
          >
            <div className="absolute left-0 top-[7%] w-[60%] rotate-[-4deg] rounded-[28px] bg-surface p-4 shadow-[var(--shadow-card)] sm:left-[3%] sm:w-[56%]">
              <div className="rounded-[20px] bg-ink px-5 py-5 text-surface">
                <div className="flex items-center justify-between text-xs text-surface/70">
                  <span>Cocina</span>
                  <span className="rounded-full bg-sun/20 px-2 py-1 font-semibold text-sun">
                    Nuevo
                  </span>
                </div>
                <p className="mt-7 text-xs font-medium uppercase tracking-[0.14em] text-surface/60">
                  Pedido #1842
                </p>
                <div className="mt-2 flex items-baseline justify-between gap-4">
                  <p className="font-display text-3xl font-semibold">Mesa 07</p>
                  <p className="font-mono text-sm tabular-nums">12:42</p>
                </div>
                <div className="mt-6 rounded-xl bg-surface/8 p-4">
                  <p className="font-semibold">1 × Açaí clásico</p>
                  <p className="mt-1 text-sm leading-relaxed text-surface/65">
                    + banana · + granola
                  </p>
                </div>
                <span className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-surface font-semibold text-ink">
                  Aceptar pedido
                </span>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-[66%] rounded-[38px] bg-ink p-2 shadow-[0_28px_60px_-28px_oklch(0.15_0.03_65/0.7)] sm:w-[61%]">
              <div className="min-h-[490px] rounded-[31px] bg-canvas px-4 pb-5 pt-4 sm:min-h-[560px] sm:px-5">
                <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-ink/15" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-ink-muted">Açaí Lab</p>
                    <p className="mt-0.5 font-semibold">Mesa 07</p>
                  </div>
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
                    Abierto
                  </span>
                </div>
                <div className="product-art mt-6 aspect-[1.35] rounded-[22px] bg-berry-soft" />
                <p className="mt-5 font-display text-2xl font-semibold tracking-tight">
                  Açaí clásico
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  Açaí, plátano, granola y fruta fresca.
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-semibold tabular-nums">S/ 22</span>
                  <span className="grid size-11 place-items-center rounded-xl bg-brand text-xl font-medium text-surface">
                    +
                  </span>
                </div>
                <div className="mt-5 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-ink-muted">Tu pedido</p>
                      <p className="mt-0.5 font-semibold">1 producto</p>
                    </div>
                    <span className="font-semibold tabular-nums">S/ 24</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute right-[1%] top-[5%] hidden w-32 rotate-[7deg] rounded-2xl bg-sun p-4 text-ink shadow-[var(--shadow-card)] sm:block">
              <p className="font-display text-3xl font-semibold leading-none">07</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em]">
                Acerca o escanea
              </p>
              <div className="mt-3 grid aspect-square place-items-center rounded-lg bg-surface/75">
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: 16 }).map((_, index) => (
                    <span
                      className={`size-2 rounded-[1px] ${
                        [0, 1, 4, 5, 7, 9, 10, 12, 14, 15].includes(index)
                          ? "bg-ink"
                          : "bg-transparent"
                      }`}
                      key={index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-ink px-5 py-24 text-surface sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sun">
                El problema real
              </p>
              <h2 className="mt-5 max-w-[12ch] text-balance font-display text-5xl font-semibold leading-[0.96] tracking-[-0.035em] sm:text-6xl">
                El cuello de botella empieza antes de la cocina.
              </h2>
            </div>
            <div className="max-w-2xl lg:pt-10">
              <p className="text-pretty text-xl leading-relaxed text-surface/70 sm:text-2xl">
                Un menú QR solo cambia el papel por una pantalla. SIRAY elimina el
                traspaso manual entre la intención del cliente y la operación del
                local.
              </p>
            </div>
          </div>

          <div className="mt-20 grid gap-4 md:grid-cols-3">
            {bottlenecks.map((item) => (
              <article
                className="rounded-[24px] bg-surface/[0.06] p-6 shadow-[inset_0_0_0_1px_oklch(1_0_0/0.08)] sm:p-8"
                key={item.number}
              >
                <p className="font-mono text-sm text-sun">{item.number}</p>
                <h3 className="mt-12 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-pretty leading-relaxed text-surface/62">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="paper-texture bg-canvas px-5 py-24 sm:px-8 sm:py-32 lg:px-12"
        id="como-funciona"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid items-end gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                Un flujo, de punta a punta
              </p>
              <h2 className="mt-5 max-w-[13ch] text-balance font-display text-5xl font-semibold leading-[0.96] tracking-[-0.035em] sm:text-6xl">
                El pedido se mueve. Tu equipo conserva el control.
              </h2>
            </div>
            <p className="max-w-2xl text-pretty text-lg leading-relaxed text-ink-muted lg:justify-self-end">
              Cocina acepta antes de preparar. El cliente ve el estado. El staff
              entrega y cobra con el sistema que ya conoce. Nada se pierde entre
              pantallas.
            </p>
          </div>

          <ol className="mt-16 grid gap-3 lg:grid-cols-5">
            {flow.map(([title, copy], index) => (
              <li
                className="elevated-card relative rounded-[22px] bg-surface p-5 lg:min-h-52"
                key={title}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-8 place-items-center rounded-full bg-brand-soft font-mono text-xs font-semibold text-brand">
                    {index + 1}
                  </span>
                  {index < flow.length - 1 ? (
                    <ArrowIcon className="icon-directional size-5 text-ink/25" />
                  ) : (
                    <CheckIcon />
                  )}
                </div>
                <h3 className="mt-14 text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{copy}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 grid gap-6 rounded-[30px] bg-brand p-6 text-surface sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Tu POS sigue cobrando. SIRAY hace que el pedido llegue.
              </p>
              <p className="mt-3 max-w-3xl text-pretty leading-relaxed text-surface/72">
                En el piloto, el staff registra el cobro en su POS habitual y marca
                la mesa como pagada en SIRAY. Integraremos solo cuando el flujo ya
                demuestre valor.
              </p>
            </div>
            <span className="w-fit rounded-full bg-surface/12 px-4 py-2 text-sm font-semibold shadow-[inset_0_0_0_1px_oklch(1_0_0/0.16)]">
              Compatible por diseño
            </span>
          </div>
        </div>
      </section>

      <section className="bg-surface px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              El primer cliente ideal
            </p>
            <h2 className="mt-5 max-w-[11ch] text-balance font-display text-5xl font-semibold leading-[0.96] tracking-[-0.035em] sm:text-6xl">
              Empieza donde más duele: horas punta.
            </h2>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-ink-muted">
              Cafés y restaurantes casuales con alta rotación, productos
              personalizables y un equipo que pierde tiempo tomando pedidos que el
              cliente podría enviar directamente.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[26px] bg-brand-soft p-7 shadow-[inset_0_0_0_1px_oklch(0.36_0.078_151/0.1)]">
              <p className="text-sm font-semibold text-brand">Buen encaje inicial</p>
              <ul className="mt-8 space-y-4">
                {[
                  "Demoras para tomar pedidos en horas punta",
                  "Pedidos con extras o modificadores",
                  "Clientes que suelen pedir una segunda ronda",
                  "POS existente que no quieren reemplazar",
                ].map((item) => (
                  <li className="flex gap-3 leading-relaxed" key={item}>
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-surface">
                      <CheckIcon />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-[26px] bg-canvas p-7 shadow-[inset_0_0_0_1px_var(--line)]">
              <p className="text-sm font-semibold text-ink-muted">No es prioridad ahora</p>
              <ul className="mt-8 space-y-4 text-ink-muted">
                {[
                  "Restaurantes donde el mesero es parte central del ritual",
                  "Facturación, inventario o planillas",
                  "Pagos integrados y billetera propia",
                  "Delivery, reservas o marketplace",
                ].map((item) => (
                  <li className="flex gap-3 leading-relaxed" key={item}>
                    <span aria-hidden="true" className="mt-3 h-px w-4 shrink-0 bg-ink/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12" id="piloto">
        <div className="paper-texture relative mx-auto max-w-7xl overflow-hidden rounded-[34px] bg-sun px-6 py-16 sm:px-12 sm:py-20 lg:px-20">
          <div aria-hidden="true" className="absolute -right-20 -top-20 size-80 rounded-full bg-surface/25" />
          <div className="relative z-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/65">
              Piloto en Lima
            </p>
            <h2 className="mt-5 text-balance font-display text-5xl font-semibold leading-[0.96] tracking-[-0.035em] sm:text-6xl">
              Valida el flujo en una mesa antes de cambiar toda tu operación.
            </h2>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink/70">
              Empezamos con un menú, una zona y un equipo. Medimos adopción,
              velocidad y errores reales antes de agregar pagos o integraciones.
            </p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row">
              <Link
                className="pressable flex min-h-12 items-center gap-2 rounded-[14px] bg-ink py-3 pl-5 pr-[18px] font-semibold text-surface hover:bg-brand"
                href="/t/demo"
              >
                Abrir demo de Mesa 07
                <ArrowIcon className="size-5" />
              </Link>
              <a
                className="pressable flex min-h-12 items-center rounded-[14px] bg-surface/65 px-5 py-3 font-semibold text-ink shadow-[inset_0_0_0_1px_oklch(0.2_0.02_70/0.12)] hover:bg-surface"
                href="mailto:hola@siray.app?subject=Quiero%20probar%20SIRAY"
              >
                Solicitar un piloto
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-5 pb-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-line py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 font-semibold text-ink">
            <SirayMark />
            <span translate="no">SIRAY</span>
          </div>
          <p>Pedidos digitales para negocios físicos.</p>
          <p>Hecho en Lima, Perú.</p>
        </div>
      </footer>
    </main>
  );
}
