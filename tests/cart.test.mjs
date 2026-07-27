import assert from "node:assert/strict";
import test from "node:test";

import { parseStoredCart } from "../lib/cart/persistence.ts";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  cartSubtotal,
  normalizeWhatsAppNumber,
} from "../lib/whatsapp/order-message.ts";

const store = {
  active: true,
  currency: "BRL",
  description: null,
  id: "store-test",
  instagramUrl: null,
  locale: "pt-BR",
  logoUrl: null,
  name: "Loja Teste",
  showPrices: true,
  slug: "loja-teste",
  whatsappDefaultMessage: null,
  whatsappNumber: "5563999999999",
};

const pricedItem = {
  imageAlt: null,
  imageUrl: null,
  name: "Peça de teste",
  price: 189,
  productId: "product-test",
  quantity: 2,
  slug: "peca-de-teste",
  status: "active",
  variationId: null,
  variationName: "Dourado",
};

test("normaliza telefone local e internacional sem inventar número", () => {
  assert.equal(normalizeWhatsAppNumber("(63) 99999-9999"), "5563999999999");
  assert.equal(normalizeWhatsAppNumber("+55 63 99999-9999"), "5563999999999");
  assert.equal(normalizeWhatsAppNumber(null), null);
  assert.equal(normalizeWhatsAppNumber("123"), null);
});

test("monta mensagem com itens, variação, valor, link, subtotal e origem", () => {
  const message = buildWhatsAppMessage({
    items: [pricedItem],
    origin: "teste automatizado",
    siteOrigin: "https://helena.example",
    store,
  });

  assert.match(message, /Loja Teste/);
  assert.match(message, /Peça de teste/);
  assert.match(message, /Quantidade: 2/);
  assert.match(message, /Variação: Dourado/);
  assert.match(message, /R\$\s189,00/);
  assert.match(message, /https:\/\/helena\.example\/produto\/peca-de-teste/);
  assert.match(message, /Subtotal informado: R\$\s378,00/);
  assert.match(message, /Origem: teste automatizado/);
  assert.match(buildWhatsAppUrl("5563999999999", message), /text=.*%0A/);
});

test("omite subtotal quando algum valor está sob consulta", () => {
  const items = [pricedItem, { ...pricedItem, productId: "other", price: null }];
  assert.equal(cartSubtotal(items), null);
  assert.doesNotMatch(
    buildWhatsAppMessage({
      items,
      origin: "teste",
      siteOrigin: "https://helena.example",
      store,
    }),
    /Subtotal informado/,
  );
});

test("estado persistido valida versão, quantidade e campos", () => {
  const parsed = parseStoredCart(JSON.stringify({
    items: [{ ...pricedItem, quantity: 120 }],
    version: 1,
  }));
  assert.equal(parsed.version, 1);
  assert.equal(parsed.items.length, 1);
  assert.equal(parsed.items[0].quantity, 99);
  assert.deepEqual(parseStoredCart("not-json").items, []);
  assert.deepEqual(parseStoredCart(JSON.stringify({ items: [], version: 99 })).items, []);
});
