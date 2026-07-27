"use client";

export default function ShopError({ reset }: { reset: () => void }) {
  return (
    <main className="store-error">
      <p>A conexão oscilou</p>
      <h1>Não foi possível abrir a loja agora.</h1>
      <span>Suas escolhas continuam seguras. Tente novamente em instantes.</span>
      <button type="button" onClick={reset}>Tentar novamente</button>
    </main>
  );
}

