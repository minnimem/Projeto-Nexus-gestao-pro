import "./DashboardWorkspaceHero.css";

export function DashboardWorkspaceHero() {
  return (
    <section className="workspace-hero" aria-label="Resumo premium da operação">
      <article>
        <span>Fluxo fiscal</span>
        <strong>NF-e, NFC-e e NFS-e</strong>
        <small>Homologação, XML, retorno e DANFE controlado.</small>
      </article>
      <article>
        <span>Operação de loja</span>
        <strong>PDV + Estoque + Caixa</strong>
        <small>Venda, separação, saldo e recebimento conectados.</small>
      </article>
      <article>
        <span>Gestão executiva</span>
        <strong>Filiais e indicadores</strong>
        <small>Relatórios, alertas e follow-ups por unidade.</small>
      </article>
    </section>
  );
}
