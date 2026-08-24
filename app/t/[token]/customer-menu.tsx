"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Modifier = {
  id: string;
  name: string;
  price: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Bowls" | "Café" | "Para acompañar";
  artClass: string;
  artBackground: string;
  badge?: string;
  modifiers?: Modifier[];
};

type CartItem = {
  key: string;
  product: Product;
  modifiers: Modifier[];
  quantity: number;
};

const products: Product[] = [
  {
    id: "acai-clasico",
    name: "Açaí clásico",
    description: "Açaí, plátano, granola artesanal y fruta fresca.",
    price: 22,
    category: "Bowls",
    artClass: "product-art",
    artBackground: "bg-berry-soft",
    badge: "Más pedido",
    modifiers: [
      { id: "banana", name: "Banana", price: 2 },
      { id: "granola", name: "Granola extra", price: 2 },
      { id: "mani", name: "Mantequilla de maní", price: 3 },
    ],
  },
  {
    id: "bowl-tropical",
    name: "Bowl tropical",
    description: "Açaí, mango, piña, coco tostado y granola.",
    price: 24,
    category: "Bowls",
    artClass: "product-art product-art--tropical",
    artBackground: "bg-sun/25",
    modifiers: [
      { id: "mango", name: "Mango extra", price: 3 },
      { id: "coco", name: "Coco tostado", price: 2 },
      { id: "chia", name: "Semillas de chía", price: 2 },
    ],
  },
  {
    id: "flat-white",
    name: "Flat white",
    description: "Doble espresso y leche texturizada.",
    price: 11,
    category: "Café",
    artClass: "product-art product-art--coffee",
    artBackground: "bg-surface-strong",
    badge: "Favorito",
    modifiers: [
      { id: "avena", name: "Leche de avena", price: 2 },
      { id: "shot", name: "Shot extra", price: 3 },
    ],
  },
  {
    id: "cold-brew",
    name: "Cold brew",
    description: "Café filtrado en frío durante 16 horas.",
    price: 12,
    category: "Café",
    artClass: "product-art product-art--cold",
    artBackground: "bg-brand-soft",
    modifiers: [
      { id: "naranja", name: "Rodaja de naranja", price: 1 },
      { id: "avena", name: "Leche de avena", price: 2 },
    ],
  },
  {
    id: "cookie",
    name: "Cookie de chocolate",
    description: "Galleta suave con chocolate bitter y sal de Maras.",
    price: 8,
    category: "Para acompañar",
    artClass: "product-art product-art--cookie",
    artBackground: "bg-sun/20",
  },
];

function price(value: number) {
  return `S/ ${value}`;
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M5.5 8.5h13l-1 11h-11l-1-11ZM9 9V7a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function CheckIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
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

function SirayWordmark() {
  return (
    <span className="flex items-center gap-2.5 font-semibold tracking-[-0.02em]" translate="no">
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-[11px] bg-brand text-surface"
      >
        S
      </span>
      SIRAY
    </span>
  );
}

function CartContents({
  cart,
  total,
  updateQuantity,
  submitOrder,
}: {
  cart: CartItem[];
  total: number;
  updateQuantity: (key: string, delta: number) => void;
  submitOrder: () => void;
}) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="grid min-h-64 place-items-center rounded-[20px] bg-canvas p-8 text-center">
        <div>
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
            <BagIcon />
          </span>
          <p className="mt-5 font-semibold">Tu pedido está vacío</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Agrega un producto del menú para comenzar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-5">
        {cart.map((item) => {
          const unitPrice =
            item.product.price + item.modifiers.reduce((sum, modifier) => sum + modifier.price, 0);

          return (
            <article className="flex gap-3" key={item.key}>
              <div
                aria-hidden="true"
                className={`${item.product.artClass} ${item.product.artBackground} size-16 shrink-0 rounded-[16px]`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold leading-snug">{item.product.name}</h3>
                    {item.modifiers.length > 0 ? (
                      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                        {item.modifiers.map((modifier) => modifier.name).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums">
                    {price(unitPrice * item.quantity)}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <button
                    aria-label={`Quitar una unidad de ${item.product.name}`}
                    className="pressable grid size-10 place-items-center rounded-xl bg-canvas text-ink-muted hover:text-ink"
                    onClick={() => updateQuantity(item.key, -1)}
                    type="button"
                  >
                    <MinusIcon />
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    aria-label={`Agregar una unidad de ${item.product.name}`}
                    className="pressable grid size-10 place-items-center rounded-xl bg-canvas text-ink-muted hover:text-ink"
                    onClick={() => updateQuantity(item.key, 1)}
                    type="button"
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-7 rounded-[18px] bg-canvas p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-ink-muted">
            {itemCount === 1 ? "1 producto" : `${itemCount} productos`}
          </span>
          <span className="text-lg font-semibold tabular-nums">{price(total)}</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          El pago se realiza con el medio habitual del local. Esta demo no procesa pagos.
        </p>
      </div>

      <button
        className="pressable mt-4 min-h-12 w-full rounded-[14px] bg-brand px-5 py-3 font-semibold text-surface hover:bg-brand-hover"
        onClick={submitOrder}
        type="button"
      >
        Enviar pedido a cocina
      </button>
    </div>
  );
}

function OrderConfirmation({ onOrderMore }: { onOrderMore: () => void }) {
  const statuses = [
    ["Recibido", "Tu pedido llegó al local."],
    ["Aceptado", "Cocina revisará el pedido."],
    ["En preparación", "Tu pedido se está preparando."],
    ["Listo", "El equipo lo llevará a tu mesa."],
  ];

  return (
    <main className="min-h-screen bg-canvas px-5 pb-12 pt-5 sm:px-8">
      <div className="mx-auto max-w-xl">
        <header className="flex items-center justify-between">
          <Link className="min-h-11 rounded-xl py-1 pr-3" href="/">
            <SirayWordmark />
          </Link>
          <span className="rounded-full bg-sun/25 px-3 py-1.5 text-xs font-semibold text-warning">
            Demo
          </span>
        </header>

        <section className="mt-14">
          <span className="grid size-14 place-items-center rounded-[18px] bg-brand text-surface shadow-[0_12px_24px_-14px_oklch(0.25_0.08_151/0.8)]">
            <CheckIcon className="size-7" />
          </span>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Pedido #1842 · Mesa 07
          </p>
          <h1
            className="mt-3 text-balance font-display text-5xl font-semibold leading-[0.96] tracking-[-0.04em]"
            id="order-confirmation-title"
            tabIndex={-1}
          >
            Tu pedido ya está en el flujo.
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-muted">
            El local lo recibió. Verás aquí cada cambio de estado sin recargar la página.
          </p>
        </section>

        <section
          aria-label="Estado del pedido"
          aria-live="polite"
          className="mt-10 rounded-[26px] bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-ink-muted">Estado actual</p>
              <p className="mt-1 font-semibold text-brand">Esperando aceptación</p>
            </div>
            <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
              Recién enviado
            </span>
          </div>

          <ol className="mt-8 space-y-0">
            {statuses.map(([title, copy], index) => (
              <li className="relative grid grid-cols-[32px_1fr] gap-4 pb-7 last:pb-0" key={title}>
                {index < statuses.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[15px] top-7 h-full w-px bg-line"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className={`relative z-10 mt-0.5 grid size-8 place-items-center rounded-full ${
                    index === 0
                      ? "bg-brand text-surface"
                      : "bg-canvas text-ink-muted shadow-[inset_0_0_0_1px_var(--line)]"
                  }`}
                >
                  {index === 0 ? <CheckIcon className="size-4" /> : index + 1}
                </span>
                <div>
                  <p className={`font-semibold ${index === 0 ? "text-ink" : "text-ink-muted"}`}>
                    {title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-6 rounded-[22px] bg-sun/20 p-5">
          <p className="font-semibold">Esta pantalla es una demostración</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            El siguiente vertical slice conectará estos estados con cocina y Supabase Realtime.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="pressable min-h-12 rounded-[14px] bg-brand px-5 py-3 font-semibold text-surface hover:bg-brand-hover"
            onClick={onOrderMore}
            type="button"
          >
            Pedir algo más
          </button>
          <Link
            className="pressable flex min-h-12 items-center justify-center rounded-[14px] bg-surface px-5 py-3 font-semibold shadow-[var(--shadow-card)] hover:bg-surface-strong"
            href="/"
          >
            Volver a SIRAY
          </Link>
        </div>
      </div>
    </main>
  );
}

export function CustomerMenu() {
  const productDialogRef = useRef<HTMLDialogElement>(null);
  const cartDialogRef = useRef<HTMLDialogElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const total = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const modifiersTotal = item.modifiers.reduce(
          (modifierSum, modifier) => modifierSum + modifier.price,
          0,
        );
        return sum + (item.product.price + modifiersTotal) * item.quantity;
      }, 0),
    [cart],
  );

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (submitted) {
      window.scrollTo({ top: 0, behavior: "instant" });
      requestAnimationFrame(() => {
        document.getElementById("order-confirmation-title")?.focus();
      });
    }
  }, [submitted]);

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedModifiers([]);
    productDialogRef.current?.showModal();
  }

  function toggleModifier(modifierId: string) {
    setSelectedModifiers((current) =>
      current.includes(modifierId)
        ? current.filter((id) => id !== modifierId)
        : [...current, modifierId],
    );
  }

  function addSelectedProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProduct) return;

    const modifiers = (selectedProduct.modifiers ?? []).filter((modifier) =>
      selectedModifiers.includes(modifier.id),
    );
    const modifierKey = modifiers
      .map((modifier) => modifier.id)
      .sort()
      .join("-");
    const key = `${selectedProduct.id}:${modifierKey}`;

    setCart((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { key, product: selectedProduct, modifiers, quantity: 1 }];
    });
    productDialogRef.current?.close();
  }

  function updateQuantity(key: string, delta: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function submitOrder() {
    if (cart.length === 0) return;
    cartDialogRef.current?.close();
    setCart([]);
    setSubmitted(true);
  }

  if (submitted) {
    return <OrderConfirmation onOrderMore={() => setSubmitted(false)} />;
  }

  return (
    <main className="min-h-screen bg-canvas pb-28 lg:pb-12">
      <header className="sticky top-0 z-30 bg-canvas/95 px-5 py-4 shadow-[0_1px_0_var(--line)] backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link className="min-h-11 rounded-xl py-1 pr-3" href="/">
            <SirayWordmark />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-sun/25 px-3 py-1.5 text-xs font-semibold text-warning sm:inline-flex">
              Demo interactiva
            </span>
            <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
              Mesa 07
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12 lg:pt-12">
        <div className="min-w-0">
          <section className="rounded-[26px] bg-brand p-6 text-surface sm:p-8">
            <p className="text-sm font-semibold text-sun">Açaí Lab · San Isidro</p>
            <h1 className="mt-3 max-w-[14ch] text-balance font-display text-4xl font-semibold leading-[0.98] tracking-[-0.035em] sm:text-5xl">
              Pide cuando estés listo.
            </h1>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-surface/72">
              Elige, personaliza y envía tu pedido. No necesitas crear una cuenta.
            </p>
          </section>

          <nav
            aria-label="Categorías del menú"
            className="-mx-5 mt-6 flex gap-3 overflow-x-auto px-5 pb-2 [scroll-padding-inline:1.25rem] sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0"
          >
            {["Bowls", "Café", "Para acompañar"].map((category) => (
              <a
                className="pressable flex min-h-11 shrink-0 items-center rounded-full bg-surface px-4 text-sm font-semibold shadow-[var(--shadow-card)] hover:bg-brand-soft hover:text-brand"
                href={`#${category.toLowerCase().replaceAll(" ", "-")}`}
                key={category}
              >
                {category}
              </a>
            ))}
          </nav>

          {["Bowls", "Café", "Para acompañar"].map((category) => (
            <section
              className="mt-12 scroll-mt-32"
              id={category.toLowerCase().replaceAll(" ", "-")}
              key={category}
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                    Menú
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                    {category}
                  </h2>
                </div>
                <p className="text-sm text-ink-muted">
                  {products.filter((product) => product.category === category).length}{" "}
                  {products.filter((product) => product.category === category).length === 1
                    ? "opción"
                    : "opciones"}
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {products
                  .filter((product) => product.category === category)
                  .map((product) => (
                    <article
                      className="elevated-card overflow-hidden rounded-[24px] bg-surface p-3"
                      key={product.id}
                    >
                      <div
                        aria-hidden="true"
                        className={`${product.artClass} ${product.artBackground} aspect-[1.55] rounded-[16px]`}
                      >
                        {product.badge ? (
                          <span className="absolute left-3 top-3 z-10 rounded-full bg-surface/88 px-2.5 py-1 text-xs font-semibold text-ink shadow-[0_1px_8px_oklch(0_0_0/0.08)] backdrop-blur-sm">
                            {product.badge}
                          </span>
                        ) : null}
                      </div>
                      <div className="p-3 pb-2 pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-muted">
                              {product.description}
                            </p>
                          </div>
                          <p className="shrink-0 font-semibold tabular-nums">
                            {price(product.price)}
                          </p>
                        </div>
                        <button
                          className="pressable mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-[13px] bg-brand-soft px-4 font-semibold text-brand hover:bg-brand hover:text-surface"
                          onClick={() => openProduct(product)}
                          type="button"
                        >
                          <PlusIcon />
                          {product.modifiers ? "Personalizar y agregar" : "Agregar al pedido"}
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          ))}

          <div className="mt-14 rounded-[22px] bg-surface-strong p-5 text-sm leading-relaxed text-ink-muted">
            <p className="font-semibold text-ink">¿Tienes una alergia?</p>
            <p className="mt-2">
              Habla con el equipo antes de ordenar. La información de esta demo es ilustrativa.
            </p>
          </div>
        </div>

        <aside className="sticky top-28 hidden rounded-[26px] bg-surface p-5 shadow-[var(--shadow-card)] lg:block">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-ink-muted">Mesa 07</p>
              <h2 className="mt-1 text-xl font-semibold">Tu pedido</h2>
            </div>
            {itemCount > 0 ? (
              <span className="grid size-9 place-items-center rounded-full bg-brand text-sm font-semibold text-surface tabular-nums">
                {itemCount}
              </span>
            ) : null}
          </div>
          <div className="mt-6">
            <CartContents
              cart={cart}
              submitOrder={submitOrder}
              total={total}
              updateQuantity={updateQuantity}
            />
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 bg-canvas/96 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-1px_0_var(--line)] backdrop-blur-md lg:hidden">
        <button
          className="pressable mx-auto flex min-h-12 w-full max-w-xl items-center justify-between rounded-[14px] bg-brand px-4 py-3 font-semibold text-surface hover:bg-brand-hover"
          onClick={() => cartDialogRef.current?.showModal()}
          type="button"
        >
          <span className="flex items-center gap-2">
            <BagIcon />
            Ver pedido
            {itemCount > 0 ? ` · ${itemCount}` : ""}
          </span>
          <span className="tabular-nums">{price(total)}</span>
        </button>
      </div>

      <dialog
        aria-labelledby="product-dialog-title"
        className="m-auto max-h-[90dvh] w-[min(32rem,calc(100vw_-_2rem))] overflow-y-auto rounded-[28px] bg-canvas p-0 shadow-[0_28px_80px_-24px_oklch(0.12_0.02_70/0.7)]"
        ref={productDialogRef}
      >
        {selectedProduct ? (
          <form onSubmit={addSelectedProduct}>
            <div
              aria-hidden="true"
              className={`${selectedProduct.artClass} ${selectedProduct.artBackground} aspect-[1.55] rounded-t-[28px]`}
            />
            <div className="relative p-5 sm:p-6">
              <button
                aria-label="Cerrar detalles del producto"
                className="pressable absolute -top-14 right-4 grid size-11 place-items-center rounded-full bg-surface text-ink shadow-[var(--shadow-card)]"
                onClick={() => productDialogRef.current?.close()}
                type="button"
              >
                <CloseIcon />
              </button>
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h2
                    className="font-display text-3xl font-semibold tracking-tight"
                    id="product-dialog-title"
                  >
                    {selectedProduct.name}
                  </h2>
                  <p className="mt-3 text-pretty leading-relaxed text-ink-muted">
                    {selectedProduct.description}
                  </p>
                </div>
                <p className="shrink-0 pt-1 font-semibold tabular-nums">
                  {price(selectedProduct.price)}
                </p>
              </div>

              {selectedProduct.modifiers ? (
                <fieldset className="mt-7">
                  <legend className="font-semibold">Agrega extras</legend>
                  <p className="mt-1 text-sm text-ink-muted">Opcional · elige todos los que quieras</p>
                  <div className="mt-4 space-y-3">
                    {selectedProduct.modifiers.map((modifier) => (
                      <label
                        className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-[16px] bg-surface p-4 shadow-[var(--shadow-card)]"
                        key={modifier.id}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            checked={selectedModifiers.includes(modifier.id)}
                            className="size-5 accent-[var(--brand)]"
                            onChange={() => toggleModifier(modifier.id)}
                            type="checkbox"
                          />
                          <span>{modifier.name}</span>
                        </span>
                        <span className="text-sm font-medium tabular-nums text-ink-muted">
                          +{price(modifier.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              <button
                className="pressable mt-7 flex min-h-12 w-full items-center justify-between rounded-[14px] bg-brand px-5 py-3 font-semibold text-surface hover:bg-brand-hover"
                type="submit"
              >
                <span>Agregar al pedido</span>
                <span className="tabular-nums">
                  {price(
                    selectedProduct.price +
                      (selectedProduct.modifiers ?? [])
                        .filter((modifier) => selectedModifiers.includes(modifier.id))
                        .reduce((sum, modifier) => sum + modifier.price, 0),
                  )}
                </span>
              </button>
            </div>
          </form>
        ) : null}
      </dialog>

      <dialog
        aria-labelledby="cart-dialog-title"
        className="m-auto max-h-[90dvh] w-[min(32rem,calc(100vw_-_2rem))] overflow-y-auto rounded-[28px] bg-surface p-0 shadow-[0_28px_80px_-24px_oklch(0.12_0.02_70/0.7)]"
        ref={cartDialogRef}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-ink-muted">Mesa 07</p>
              <h2 className="mt-1 text-xl font-semibold" id="cart-dialog-title">
                Tu pedido
              </h2>
            </div>
            <button
              aria-label="Cerrar pedido"
              className="pressable grid size-11 place-items-center rounded-full bg-canvas text-ink"
              onClick={() => cartDialogRef.current?.close()}
              type="button"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="mt-6">
            <CartContents
              cart={cart}
              submitOrder={submitOrder}
              total={total}
              updateQuantity={updateQuantity}
            />
          </div>
        </div>
      </dialog>
    </main>
  );
}
