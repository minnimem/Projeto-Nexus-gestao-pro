import { Plus, X } from "lucide-react";
import { asList, formatCurrency, formatNumber } from "../../../utils/formatters";
import { getClientId, getClientName } from "../../../utils/customers";
import { getProductId } from "../../../utils/products";
import {
  serviceChecklistTemplates,
  serviceOrderFlowSteps,
  serviceOrderPriorities,
} from "../constants/serviceConstants";
import { ServiceOrderFlowActions } from "./ServiceOrderFlowActions";
import { ServiceOrderSummaryStep } from "./ServiceOrderSummaryStep";

export function ServiceOrderForm({
  addChecklistLine,
  addSelectedServicePart,
  applyChecklistTemplate,
  clientes,
  contratos,
  filiais,
  form,
  formChecklistItems,
  formStep,
  getServicePartProductLabel,
  goToNextServiceStep,
  goToPreviousServiceStep,
  handleCreateServiceOrder,
  message,
  produtos,
  removeServicePart,
  saving,
  servicePartsTotalCost,
  servicePartsTotalSale,
  setFormStep,
  tecnicos,
  updateChecklistLine,
  updateChecklistText,
  updateForm,
}) {
  return (        <aside className="panel side-panel">
          <div className="panel-title compact">
            <div>
              <h2>Abrir ordem de serviço</h2>
              <p>Cliente, responsável, checklist e prazo em um fluxo rápido.</p>
            </div>
          </div>

          <form className="compact-form service-order-flow" onSubmit={handleCreateServiceOrder}>
            <div className="service-flow-steps">
              {serviceOrderFlowSteps.map((step) => (
                <button
                  className={formStep === step.key ? "active" : ""}
                  key={step.key}
                  onClick={() => setFormStep(step.key)}
                  type="button"
                >
                  {step.label}
                </button>
              ))}
            </div>

            {formStep === "cliente" && (
              <div className="service-step-panel">
                <label className="form-control">
                  <span>Cliente</span>
                  <select value={form.clienteId} onChange={(event) => updateForm("clienteId", event.target.value)}>
                    <option value="">Selecione</option>
                    {clientes.map((cliente) => (
                      <option key={getClientId(cliente)} value={getClientId(cliente)}>
                        {getClientName(cliente)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-control">
                  <span>Filial</span>
                  <select value={form.filialId} onChange={(event) => updateForm("filialId", event.target.value)}>
                    <option value="">Empresa / sem filial</option>
                    {filiais.map((filial) => (
                      <option key={filial.id} value={filial.id}>
                        {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {formStep === "tecnico" && (
              <div className="service-step-panel">
                <label className="form-control">
                  <span>Técnico</span>
                  <select value={form.tecnicoId} onChange={(event) => updateForm("tecnicoId", event.target.value)}>
                    <option value="">Sem técnico</option>
                    {tecnicos.map((tecnico) => (
                      <option key={tecnico.id} value={tecnico.id}>
                        {tecnico.nome || tecnico.login || tecnico.email}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-control">
                  <span>Prioridade</span>
                  <select value={form.prioridade} onChange={(event) => updateForm("prioridade", event.target.value)}>
                    {serviceOrderPriorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label} / SLA {priority.slaHours}h
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {formStep === "servico" && (
              <div className="service-step-panel">
                <label className="form-control">
                  <span>Título</span>
                  <input value={form.titulo} onChange={(event) => updateForm("titulo", event.target.value)} placeholder="Ex.: Instalação de equipamento" />
                </label>
                <label className="form-control">
                  <span>Descrição</span>
                  <textarea value={form.descricao} onChange={(event) => updateForm("descricao", event.target.value)} placeholder="Problema, escopo ou solicitação" />
                </label>
              </div>
            )}

            {formStep === "checklist" && (
              <div className="service-step-panel">
                <div className="service-template-row">
                  {serviceChecklistTemplates.map((template) => (
                    <button key={template.key} onClick={() => applyChecklistTemplate(template)} type="button">
                      {template.label}
                    </button>
                  ))}
                </div>
                <div className="service-checklist-editor">
                  {(formChecklistItems.length > 0 ? formChecklistItems : [{ done: false, text: "" }]).map((item, index) => (
                    <label className="service-check-item" key={`${item.text}-${index}`}>
                      <input checked={item.done} onChange={(event) => updateChecklistLine(index, event.target.checked)} type="checkbox" />
                      <input value={item.text} onChange={(event) => updateChecklistText(index, event.target.value)} placeholder="Item do checklist" />
                    </label>
                  ))}
                </div>
                <button className="mini-action-button" onClick={addChecklistLine} type="button">
                  <Plus size={14} />
                  Item
                </button>
              </div>
            )}

            {formStep === "prazo" && (
              <div className="service-step-panel">
                <div className="finance-form-row">
                  <label className="form-control">
                    <span>Prazo</span>
                    <input type="date" value={form.prazo} onChange={(event) => updateForm("prazo", event.target.value)} />
                  </label>
                  <label className="form-control">
                    <span>Valor previsto</span>
                    <input type="number" min="0" step="0.01" value={form.valorEstimado} onChange={(event) => updateForm("valorEstimado", event.target.value)} placeholder="0,00" />
                  </label>
                </div>
                <div className="finance-form-row">
                  <label className="form-control">
                    <span>Tipo de serviço</span>
                    <select value={form.tipoServico} onChange={(event) => updateForm("tipoServico", event.target.value)}>
                      <option value="AVULSO">Avulso</option>
                      <option value="CONTRATO">Contrato</option>
                      <option value="GARANTIA">Garantia</option>
                      <option value="RECORRENTE">Recorrente</option>
                    </select>
                  </label>
                  <label className="form-control">
                    <span>Contrato</span>
                    <select value={form.contratoId} onChange={(event) => updateForm("contratoId", event.target.value)}>
                      <option value="">Sem contrato vinculado</option>
                      {contratos.map((contrato) => (
                        <option key={contrato.id} value={contrato.id}>
                          {contrato.nome || contrato.numero || "Contrato"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="finance-form-row">
                  <label className="form-control">
                    <span>Coberto por garantia</span>
                    <select value={form.garantiaCoberta} onChange={(event) => updateForm("garantiaCoberta", event.target.value)}>
                      <option value="NAO">Não</option>
                      <option value="SIM">Sim</option>
                    </select>
                  </label>
                  <label className="form-control">
                      <span>Garantia até</span>
                    <input type="date" value={form.garantiaAte} onChange={(event) => updateForm("garantiaAte", event.target.value)} />
                  </label>
                  <label className="form-control">
                    <span>Recorrente</span>
                    <select value={form.recorrente} onChange={(event) => updateForm("recorrente", event.target.value)}>
                      <option value="NAO">Não</option>
                      <option value="SIM">Sim</option>
                    </select>
                  </label>
                </div>
                {form.recorrente === "SIM" && (
                  <div className="finance-form-row">
                    <label className="form-control">
                      <span>Intervalo meses</span>
                      <input min="1" step="1" type="number" value={form.recorrenciaIntervaloMeses} onChange={(event) => updateForm("recorrenciaIntervaloMeses", event.target.value)} />
                    </label>
                    <label className="form-control">
                      <span>Próxima recorrência</span>
                      <input type="date" value={form.proximaRecorrencia} onChange={(event) => updateForm("proximaRecorrencia", event.target.value)} />
                    </label>
                  </div>
                )}
                <label className="form-control">
                  <span>Observação</span>
                  <textarea value={form.observacao} onChange={(event) => updateForm("observacao", event.target.value)} placeholder="Notas internas da equipe" />
                </label>
                <div className="finance-form-row">
                  <label className="form-control">
                      <span>Peças utilizadas</span>
                    <input value={form.pecasUtilizadas} onChange={(event) => updateForm("pecasUtilizadas", event.target.value)} placeholder="Ex.: fonte, cabo, sensor" />
                  </label>
                  <label className="form-control">
                    <span>Assinatura do cliente</span>
                    <select value={form.assinaturaCliente} onChange={(event) => updateForm("assinaturaCliente", event.target.value)}>
                      <option value="NAO">Pendente</option>
                      <option value="SIM">Coletada</option>
                    </select>
                  </label>
                </div>
                {form.assinaturaCliente === "SIM" && (
                  <div className="finance-form-row">
                    <label className="form-control">
                      <span>Responsável pelo aceite</span>
                      <input value={form.assinaturaClienteNome} onChange={(event) => updateForm("assinaturaClienteNome", event.target.value)} placeholder="Nome de quem validou" />
                    </label>
                    <label className="form-control">
                      <span>Documento</span>
                      <input value={form.assinaturaClienteDocumento} onChange={(event) => updateForm("assinaturaClienteDocumento", event.target.value)} placeholder="CPF, RG ou outro documento" />
                    </label>
                    <label className="form-control">
                      <span>Observação do aceite</span>
                      <input value={form.assinaturaClienteObservacao} onChange={(event) => updateForm("assinaturaClienteObservacao", event.target.value)} placeholder="Ex.: aceite presencial" />
                    </label>
                  </div>
                )}
                <div className="finance-form-row">
                  <label className="form-control">
                    <span>Produto do estoque</span>
                    <select value={form.pecaProdutoId} onChange={(event) => updateForm("pecaProdutoId", event.target.value)}>
                      <option value="">Selecione uma peça</option>
                      {produtos.map((produto) => (
                        <option key={getProductId(produto)} value={getProductId(produto)}>
                          {getServicePartProductLabel(produto)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-control">
                    <span>Quantidade</span>
                    <input min="1" step="1" type="number" value={form.pecaQuantidade} onChange={(event) => updateForm("pecaQuantidade", event.target.value)} />
                  </label>
                  <button className="mini-action-button" disabled={!form.pecaProdutoId} onClick={addSelectedServicePart} type="button">
                    <Plus size={14} />
                    Adicionar peça
                  </button>
                </div>
                {asList(form.pecasItens).length > 0 && (
                  <div className="service-parts-grid">
                    {asList(form.pecasItens).map((item) => {
                      const cost = Number(item.quantity || 0) * Number(item.unitCost || 0);
                      const sale = Number(item.quantity || 0) * Number(item.unitSale || 0);
                      return (
                        <article key={item.productId}>
                          <span>{formatNumber(item.quantity)}x</span>
                          <strong>{item.label}</strong>
                          <small>Custo {formatCurrency(cost)} / venda {formatCurrency(sale)} / margem {formatCurrency(sale - cost)}</small>
                          <button className="icon-button ghost" onClick={() => removeServicePart(item.productId)} title="Remover peça" type="button">
                            <X size={14} />
                          </button>
                        </article>
                      );
                    })}
                    <div className="service-parts-total">
                      <span>Total peças</span>
                      <strong>{formatCurrency(servicePartsTotalSale)}</strong>
                      <small>Custo {formatCurrency(servicePartsTotalCost)} / margem {formatCurrency(servicePartsTotalSale - servicePartsTotalCost)}</small>
                    </div>
                  </div>
                )}
                <label className="form-control">
                  <span>Evidências / anexos</span>
                  <input value={form.evidencias} onChange={(event) => updateForm("evidencias", event.target.value)} placeholder="Ex.: foto antes/depois, anexo no drive, comprovante" />
                </label>
              </div>
            )}

            {formStep === "finalizar" && (
              <ServiceOrderSummaryStep form={form} formChecklistItems={formChecklistItems} />
            )}

            {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

            <ServiceOrderFlowActions
              clientes={clientes}
              formStep={formStep}
              goToNextServiceStep={goToNextServiceStep}
              goToPreviousServiceStep={goToPreviousServiceStep}
              saving={saving}
            />
          </form>
        </aside>
  );
}
