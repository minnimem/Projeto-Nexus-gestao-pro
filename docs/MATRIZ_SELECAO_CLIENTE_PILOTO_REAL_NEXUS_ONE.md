# Matriz de Selecao do Cliente Piloto Real - Nexus One

Use esta matriz antes de aceitar o primeiro cliente real, piloto pago ou producao controlada inicial. O objetivo e escolher um cliente que valide o produto sem concentrar complexidade fiscal, operacional, suporte e customizacao ao mesmo tempo.

## Objetivo

- Selecionar o primeiro cliente real com menor risco.
- Evitar que a primeira implantacao vire projeto customizado.
- Garantir decisor, usuarios-chave, dados, aceite e escopo controlado.
- Aumentar a chance de gerar evidencia real, saude Verde e referencia futura.

## Perfil Recomendado

- Comercio, servico ou distribuidora simples.
- Uma filial ou poucas filiais.
- Dor clara em venda, caixa, estoque, financeiro ou relatorios.
- Decisor disponivel.
- Usuarios-chave disponiveis para treinamento.
- Dados iniciais organizados ou responsavel definido.
- Fiscal, pagamento e notificacoes reais podem ser homologados ou ficar fora do escopo inicial.
- Aceita piloto assistido ou producao controlada antes de escala.

## Pontuacao

| Criterio | Peso |
| --- | ---: |
| Dor operacional clara | 15 |
| Decisor presente | 15 |
| Escopo inicial simples | 15 |
| Dados e responsaveis disponiveis | 15 |
| Integracoes nao bloqueantes | 15 |
| Aceita piloto assistido e aceite formal | 10 |
| Baixa complexidade fiscal/logistica | 10 |
| Potencial de virar referencia | 5 |

## Decisao

| Score | Decisao |
| ---: | --- |
| 85 a 100 | Cliente ideal para primeiro caso real |
| 70 a 84 | Pode seguir com riscos controlados |
| 50 a 69 | Fazer diagnostico e reduzir escopo antes |
| 0 a 49 | Nao usar como primeiro cliente real |

## Bloqueios

- Sem decisor.
- Nao aceita piloto assistido ou producao controlada.
- Exige fiscal real imediato sem homologacao.
- Exige Pix/boleto/notificacao real no primeiro dia sem provedor/canal testado.
- Exige customizacao critica antes de validar produto base.
- Nao possui responsavel por dados, treinamento ou aceite.
- Requer muitas filiais/usuarios/logistica antes de primeiro ciclo.

## Gerador

```powershell
.\scripts\gerar-selecao-cliente-piloto-real.ps1 -Cliente "Cliente Piloto" -DorClara 15 -Decisor 15 -EscopoSimples 15 -DadosResponsaveis 15 -IntegracoesNaoBloqueantes 15 -AceitaPiloto 10 -BaixaComplexidade 10 -PotencialReferencia 5
```

