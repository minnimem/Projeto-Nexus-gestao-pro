# Politica de Privacidade e LGPD - Nexus One

Esta politica organiza controles minimos para tratar dados pessoais em demonstracao, piloto assistido e producao controlada.

## Dados Pessoais Tratados

- Clientes: nome, documento, email, telefone, endereco e historico comercial.
- Usuarios/colaboradores: nome, login, email, perfil, cargo, filial, status de acesso e auditoria.
- Financeiro: dados de cobranca, pagamentos, inadimplencia e observacoes operacionais.
- Fiscal: dados exigidos por lei, como CPF/CNPJ, endereco, IE/IM e documentos fiscais.

## Regras de Uso

- Usar dados ficticios em demonstracao sempre que possivel.
- Usar dados reais apenas em piloto/producao com autorizacao do cliente.
- Limitar acesso por perfil e permissao.
- Exportacoes CSV/PDF/JSON devem ser feitas apenas por usuario autorizado.
- Backups com dados reais devem ficar protegidos e com retencao definida.
- Nao enviar planilhas com dados pessoais por canal inseguro.

## Carga Inicial

- Conferir origem das planilhas.
- Remover dados desnecessarios antes da carga.
- Validar em homologacao antes de producao.
- Arquivar responsavel, data e aceite da carga.
- Nao carregar dados fiscais sem validacao do contador quando houver emissao real.

## Direitos do Titular

Quando houver solicitacao de acesso, correcao, exclusao, portabilidade ou informacao:

1. Registrar solicitacao.
2. Confirmar cliente/empresa responsavel.
3. Validar identidade do solicitante com o cliente controlador.
4. Classificar impacto fiscal/contabil antes de excluir ou anonimizar.
5. Registrar decisao, responsavel e data.

Gerar registro:

```powershell
.\scripts\gerar-solicitacao-lgpd.ps1 -Cliente "Cliente" -Tipo "Acesso" -Solicitante "Nome"
```

## Retencao

- Documentos fiscais e dados contabeis devem seguir prazo legal orientado pelo contador.
- Backups devem seguir a politica definida no contrato/implantacao.
- Dados de demonstracao devem ser apagados ao encerrar apresentacao ou reciclar ambiente.
- Dados de cliente piloto devem ser removidos ou formalmente migrados ao encerrar piloto.
- Encerramento de cliente, piloto ou ambiente com dados reais deve seguir `docs/PROCESSO_OFFBOARDING_ENCERRAMENTO_CLIENTE_NEXUS_ONE.md`.

## Bloqueios Comerciais

- Nao liberar producao ampla sem responsavel por privacidade definido.
- Nao usar dados reais em demonstracao aberta.
- Nao restaurar backup de producao em homologacao compartilhada sem autorizacao.
- Nao excluir dados com obrigacao fiscal/contabil sem validacao do cliente/contador.
- Nao usar nome, logo, depoimento, print, resultado ou caso de cliente sem autorizacao de referencia comercial.
- Nao encerrar acesso sem registrar exportacao, retencao, exclusao ou anonimizacao dos dados quando aplicavel.
