import { useState } from "react";
import {
  buildCartItem,
  findProductFromSearch,
  getStockLimitMessage,
  normalizeCartQuantity,
  removeCartItem,
  updateCartItemQuantity,
  upsertCartItem,
  validateProductForCart,
} from "../services/pointOfSaleCart.js";

export function usePointOfSaleCart({ produtos, productSearch, setMessage, setProductSearch }) {
  const [cart, setCart] = useState([]);

  function addProduct(produto, quantity = 1) {
    const validation = validateProductForCart({ cart, produto, quantity });
    if (validation.error) {
      setMessage({ type: "error", text: validation.error });
      return false;
    }
    const { estoqueDisponivel, produtoId, quantityToAdd } = validation;

    setCart((current) => upsertCartItem(current, buildCartItem({
      estoqueDisponivel,
      produto,
      produtoId,
      quantityToAdd,
    })));
    return true;
  }

  function addProductFromSearch() {
    const { productToAdd, quantity, query } = findProductFromSearch({ productSearch, produtos });
    if (!query) return;

    if (!productToAdd) {
      setMessage({ type: "error", text: "Produto não encontrado para o código informado." });
      return;
    }
    if (addProduct(productToAdd, quantity)) {
      setProductSearch("");
      setMessage(null);
    }
  }

  function changeQuantity(produtoId, delta) {
    setCart((current) => current.map((item) => {
      if (item.produtoId !== produtoId) return item;
      const estoqueDisponivel = Number(item.estoqueDisponivel || 0);
      const nextQuantity = Math.max(1, item.quantidade + delta);
      if (delta > 0 && estoqueDisponivel > 0 && nextQuantity > estoqueDisponivel) {
        setMessage({ type: "error", text: getStockLimitMessage(item.nome, estoqueDisponivel) });
        return item;
      }
      return updateCartItemQuantity([item], item.produtoId, nextQuantity)[0];
    }));
  }

  function setQuantity(produtoId, value) {
    const nextQuantity = normalizeCartQuantity(value);
    setCart((current) => current.map((item) => {
      if (item.produtoId !== produtoId) return item;
      const estoqueDisponivel = Number(item.estoqueDisponivel || 0);
      if (estoqueDisponivel > 0 && nextQuantity > estoqueDisponivel) {
        setMessage({ type: "error", text: getStockLimitMessage(item.nome, estoqueDisponivel) });
        return item;
      }
      setMessage(null);
      return updateCartItemQuantity([item], item.produtoId, nextQuantity)[0];
    }));
  }

  function removeProduct(produtoId) {
    setCart((current) => removeCartItem(current, produtoId));
  }

  return { addProduct, addProductFromSearch, cart, changeQuantity, removeProduct, setCart, setQuantity };
}
