export default function ShopLoading() {
  return (
    <main className="shop-page store-loading" aria-busy="true" aria-label="Carregando loja">
      <div className="store-skeleton store-skeleton-heading" />
      <div className="store-skeleton-row">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="store-skeleton store-skeleton-category" key={index} />
        ))}
      </div>
      <div className="store-skeleton-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="store-skeleton store-skeleton-product" key={index} />
        ))}
      </div>
    </main>
  );
}

