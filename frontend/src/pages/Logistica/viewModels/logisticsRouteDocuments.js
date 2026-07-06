import { normalizeStatus } from "../../../components/common/StatusUi";
import { asList, formatCurrency, formatDate, formatNumber, isDateBeforeToday } from "../../../utils/formatters";
import { escapeHtml, printHtmlDocument } from "../../../utils/exporters";

export function getRouteDriverName(rota) {
  return rota.entregador.nome || "Sem entregador";
}

export function getRouteVehicleLabel(rota) {
  if (!rota.veiculo) return "Sem veículo";
  return [rota.veiculo.placa, rota.veiculo.modelo].filter(Boolean).join(" / ");
}

export function getRouteStatus(rota) {
  return String(rota.status || "ABERTA").toUpperCase();
}

export function getRouteDeliveryCount(rota) {
  return Number(rota.quantidadeEntregas || 0);
}

export function getDeliveryCustomer(entrega) {
  return entrega.clienteNome || entrega.nomeCliente || entrega.cliente || entrega.pedido.cliente || "Cliente não informado";
}

export function getDeliveryOrderNumber(entrega) {
  return entrega.numeroPedido || entrega.pedidoNumero || entrega.pedidoId || "Pedido sem número";
}

export function getDeliveryAddress(entrega) {
  return entrega.enderecoEntrega || entrega.endereco || entrega.pedido.enderecoEntrega || entrega.pedido.clienteEndereco || "Sem endereço";
}

export function getDeliveryBranchLabel(entrega) {
  return entrega.filial || entrega.pedido.filial || "Empresa / sem filial";
}

export function getDeliveryOperationalStatus(entrega, route = null) {
  const status = normalizeStatus(entrega.status || "PENDENTE");
  const routeStatus = getRouteStatus(route);
  const routeDate = route.dataRota || entrega.dataEntrega || entrega.dataPrevista;
  const isDelayed = routeDate && isDateBeforeToday(routeDate);

  if (["CANCELADO", "CANCELADA"].includes(status)) return "CANCELADO";
  if (["ENTREGUE", "FINALIZADA", "FINALIZADO", "CONCLUIDO", "CONCLUIDA"].includes(status)) return "ENTREGUE";
  if (["ATRASADO", "VENCIDO", "EXPIRADO"].includes(status) || isDelayed) return "ATRASADO";
  if (["EM_ROTA", "EM_ANDAMENTO"].includes(status) || ["EM_ROTA", "EM_ANDAMENTO"].includes(routeStatus)) return "EM_ROTA";
  return "PENDENTE";
}

export function printDeliveryReceipt(entrega, route = null, companyName = "Nexus One") {
  if (!entrega) return;

  printHtmlDocument(
    `Comprovante entrega ${getDeliveryOrderNumber(entrega)}`,
    `
      <header>
        <h1>${escapeHtml(companyName)}</h1>
        <p>Comprovante de entrega</p>
        <p><strong>Gerado em:</strong> ${escapeHtml(new Date().toLocaleString("pt-BR"))}</p>
      </header>

      <section class="meta-grid">
        <div><span>Pedido</span><strong>${escapeHtml(getDeliveryOrderNumber(entrega))}</strong></div>
        <div><span>Cliente</span><strong>${escapeHtml(getDeliveryCustomer(entrega))}</strong></div>
        <div><span>Filial</span><strong>${escapeHtml(getDeliveryBranchLabel(entrega))}</strong></div>
        <div><span>Status</span><strong>${escapeHtml(entrega.status || "-")}</strong></div>
        <div><span>Rota</span><strong>${escapeHtml(route.nome || entrega.rotaNome || "-")}</strong></div>
        <div><span>Motorista</span><strong>${escapeHtml(route ? getRouteDriverName(route) : entrega.entregadorNome || "-")}</strong></div>
        <div><span>Data da rota</span><strong>${escapeHtml(route.dataRota ? formatDate(route.dataRota) : "-")}</strong></div>
        <div><span>Valor pedido</span><strong>${escapeHtml(formatCurrency(entrega.totalPedido || entrega.valorPedido || 0))}</strong></div>
      </section>

      <section>
        <h2>Destino</h2>
        <p>${escapeHtml(getDeliveryAddress(entrega))}</p>
      </section>

      <section>
        <h2>Observações</h2>
        <p>${escapeHtml(entrega.observacao || entrega.pedido.observacaoEntrega || "Sem observações.")}</p>
      </section>

      <section class="signature-grid">
        <div class="signature-line">Recebedor / documento</div>
        <div class="signature-line">Assinatura do cliente</div>
      </section>

      <section class="signature-grid">
        <div class="signature-line">Data e hora da entrega</div>
        <div class="signature-line">Assinatura do entregador</div>
      </section> ?
    `,
  );
}

export function getRoutePaymentLabel(rota) {
  if (rota.pagamentoEntrega === "PAGAR_NA_ENTREGA") return "Receber na entrega";
  if (rota.pagamentoEntrega === "RECEBER_RETORNO") return "Receber no retorno";
  return "Já pago";
}

export function printRouteManifest(rota, companyName = "Nexus One") {
  if (!rota) return;

  const routeDeliveries = asList(rota.entregas);
  const deliveryCount = Math.max(1, routeDeliveries.length || getRouteDeliveryCount(rota));
  const branchLabels = Array.from(new Set(routeDeliveries.map(getDeliveryBranchLabel).filter(Boolean)));
  const branchLabel = branchLabels.length === 0 ?
    "Não informado"
    : branchLabels.length === 1
      ?
      branchLabels[0]
      : `${branchLabels.length} filiais`;
  const deliveryRows = (routeDeliveries.length > 0 ? routeDeliveries : Array.from({ length: deliveryCount }))
    .map((entrega, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(entrega ? getDeliveryCustomer(entrega) : "")}</td>
      <td>${escapeHtml(entrega ? getDeliveryBranchLabel(entrega) : "")}</td>
      <td>${escapeHtml(entrega ? getDeliveryAddress(entrega) : "")}</td>
      <td>${escapeHtml(entrega ? `${getDeliveryOrderNumber(entrega)} ${entrega.observacao || ""}`.trim() : "")}</td>
      <td class="check-cell"></td>
      <td class="check-cell"></td>
    </tr>
  `).join("");

  printHtmlDocument(
    `Romaneio ${rota.nome || ""}`.trim(),
    `
      <header>
        <h1>${escapeHtml(companyName)}</h1>
        <p>Romaneio de entrega / conferência de rota</p>
        <p><strong>Rota:</strong> ${escapeHtml(rota.nome || "-")} |
          <strong>Gerado em:</strong> ${escapeHtml(new Date().toLocaleString("pt-BR"))}</p>
      </header>

      <section class="meta-grid">
        <div><span>Data da rota</span><strong>${escapeHtml(formatDate(rota.dataRota))}</strong></div>
        <div><span>Filial</span><strong>${escapeHtml(branchLabel)}</strong></div>
        <div><span>Status</span><strong>${escapeHtml(getRouteStatus(rota))}</strong></div>
        <div><span>Motorista</span><strong>${escapeHtml(getRouteDriverName(rota))}</strong></div>
        <div><span>Telefone</span><strong>${escapeHtml(rota.entregador.telefone || "-")}</strong></div>
        <div><span>Veículo</span><strong>${escapeHtml(getRouteVehicleLabel(rota))}</strong></div>
        <div><span>Pagamento</span><strong>${escapeHtml(getRoutePaymentLabel(rota))}</strong></div>
        <div><span>Entregas previstas</span><strong>${escapeHtml(formatNumber(getRouteDeliveryCount(rota)))}</strong></div>
        <div><span>Custo estimado</span><strong>${escapeHtml(formatCurrency(rota.custoEstimado || 0))}</strong></div>
      </section>

      <section>
        <h2>Checklist de entregas</h2>
        <table>
          <thead>
            <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Filial</th>
                <th>Destino</th>
                <th>Observação</th>
              <th>Entregue</th>
              <th>Recebido</th>
            </tr>
          </thead>
          <tbody>${deliveryRows}</tbody>
        </table>
      </section>

      <section>
        <h2>Observações da rota</h2>
        <p>${escapeHtml(rota.observacao || "Sem observações.")}</p>
      </section>

      <section class="signature-grid">
        <div class="signature-line">Assinatura do entregador</div>
        <div class="signature-line">Conferência no retorno</div>
      </section> ?
    `,
  );
}
