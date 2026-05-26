# Roteiro de Carga Inicial de Dados - Nexus One

Este roteiro organiza a preparacao de clientes, produtos, usuarios e estoque inicial antes de piloto assistido ou producao controlada.

## Modelos

Arquivos base:

- `templates/carga-inicial/clientes.csv`
- `templates/carga-inicial/produtos.csv`
- `templates/carga-inicial/usuarios.csv`
- `templates/carga-inicial/estoque-inicial.csv`

## Regra de Seguranca

- Validar tudo em homologacao antes de producao.
- Seguir `docs/POLITICA_PRIVACIDADE_LGPD_NEXUS_ONE.md`.
- Nao importar dados fiscais sem validacao do contador.
- Nao usar planilha com dados sensiveis em ambiente compartilhado.
- Gerar backup antes de carga em producao.
- Arquivar responsavel, data e origem da planilha.

## Ordem Recomendada

1. Empresa e filial.
2. Usuarios e perfis.
3. Clientes.
4. Produtos.
5. Estoque inicial.
6. Regras fiscais e comerciais.
7. Formas de pagamento.
8. Logistica, quando contratada.

## Validacao dos Arquivos

Rodar:

```powershell
.\scripts\verificar-carga-inicial.ps1 -InputDir templates\carga-inicial -OutputDir reports
```

O script valida presenca dos arquivos, cabecalhos esperados e quantidade de linhas. Ele nao importa dados no banco.

## Aceite da Carga

- Cliente conferiu amostra dos cadastros.
- Origem/autorizacao dos dados foi registrada.
- Estoque inicial foi conferido por responsavel operacional.
- Usuarios receberam perfil correto.
- Produtos com fiscal real foram revisados por contador.
- Pendencias foram classificadas como bloqueantes ou nao bloqueantes.

## Bloqueios

- Produto sem codigo/nome/preco quando usado em venda.
- Estoque inicial sem produto correspondente.
- Usuario sem perfil ou filial quando a operacao exigir filial.
- Dados fiscais incompletos vendidos como emissao oficial.
- Carga em producao sem backup anterior.
