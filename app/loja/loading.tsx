export default function ShopLoading() {
  return (
    <main className="shop-page store-loading" aria-busy="true" aria-label="Preparando a curadoria Helena">
      <section className="store-loading-scene">
        <div className="store-loading-copy">
          <p><i /> Curadoria Helena</p>
          <h1>Escolhas que<br /><em>ganham forma.</em></h1>
          <span>Preparando a loja para você</span>
        </div>
        <div className="store-loading-jewel" aria-hidden="true">
          <i /><i /><i />
          <strong>H</strong>
        </div>
        <div className="store-loading-progress" aria-hidden="true">
          <span>Seleção</span><i /><span>Presença</span>
        </div>
        <p className="store-loading-note" aria-hidden="true">Forma · luz · detalhe</p>
      </section>
    </main>
  );
}
