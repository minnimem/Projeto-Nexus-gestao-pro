import { getClientId, getClientName } from "../../../utils/customers";
import { parseProductSearchCommand } from "../../../utils/products";

export function getPointOfSaleProductSearch({ productSearch, produtos }) {
  const productSearchCommand = parseProductSearchCommand(productSearch);
  const productSearchTerm = productSearchCommand.term.toLowerCase();
  const activeProducts = produtos.filter((produto) => produto.ativo !== false);
  const filteredProducts = activeProducts
    .filter((produto) => `${produto.nome || ""} ${produto.codigoBarras || ""}`.toLowerCase().includes(productSearchTerm))
    .slice(0, 8);

  return { activeProducts, filteredProducts, productSearchCommand };
}

export function getPointOfSaleClientSearch({ clientes, clientSearch, selectedClienteId }) {
  const selectedCliente = clientes.find(
    (cliente) => String(getClientId(cliente)) === String(selectedClienteId),
  );
  const filteredClientes = clientes
    .filter((cliente) =>
      `${getClientName(cliente)} ${cliente.cpf || ""} ${cliente.email || ""}`
        .toLowerCase()
        .includes(clientSearch.toLowerCase()),
    )
    .slice(0, 8);

  return { filteredClientes, selectedCliente };
}
