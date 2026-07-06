import { useEffect, useMemo, useState } from "react";
import { endpoints } from "../../../services/resources";
import { asList } from "../../../utils/formatters";

export function useFinancePedidoHydration({ pedidoIdsComFinanceiro, pedidos, vendasRecebidas }) {
  const [hydratedPedidos, setHydratedPedidos] = useState([]);
  const pedidosHydratedPorId = useMemo(
    () => new Map(hydratedPedidos.map((pedido) => [String(pedido.id), pedido])),
    [hydratedPedidos],
  );
  const pedidosPorId = useMemo(() => {
    const mapa = new Map(pedidos.map((pedido) => [String(pedido.id), pedido]));
    hydratedPedidos.forEach((pedido) => mapa.set(String(pedido.id), pedido));
    return mapa;
  }, [pedidos, hydratedPedidos]);
  const missingPedidoIds = useMemo(
    () => vendasRecebidas
      .filter((pedido) => !pedidoIdsComFinanceiro.has(String(pedido.id)))
      .map((pedido) => pedidosPorId.get(String(pedido.id)) || pedido)
      .filter((pedido) => {
        const id = String(pedido.id || "");
        return id && asList(pedido.itens).length === 0 && !pedidosHydratedPorId.has(id);
      })
      .map((pedido) => String(pedido.id)),
    [pedidoIdsComFinanceiro, pedidosHydratedPorId, pedidosPorId, vendasRecebidas],
  );

  useEffect(() => {
    if (missingPedidoIds.length === 0) return undefined;
    let active = true;
    Promise.allSettled(
      missingPedidoIds.map(async (id) => {
        const pedido = await endpoints.pedidos.obter(id);
        if (asList(pedido.itens).length > 0) return pedido;
        const itens = await endpoints.pedidos.itens(id);
        return { ...pedido, itens: asList(itens) };
      }),
    )
      .then((results) => {
        if (!active) return;
        const loadedPedidos = results
          .filter((result) => result.status === "fulfilled" && result.value.id)
          .map((result) => result.value);
        if (loadedPedidos.length === 0) return;
        setHydratedPedidos((current) => {
          const mapa = new Map(current.map((pedido) => [String(pedido.id), pedido]));
          loadedPedidos.forEach((pedido) => mapa.set(String(pedido.id), pedido));
          return Array.from(mapa.values());
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [missingPedidoIds]);

  return { pedidosPorId };
}

