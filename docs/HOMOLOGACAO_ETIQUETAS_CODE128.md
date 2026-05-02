# Homologacao de Etiquetas Code128

Este roteiro valida impressao e leitura fisica das etiquetas 60mm x 35mm geradas pelo Nexus One.

## 1. Gerar folha de calibracao

Na raiz do projeto:

```powershell
node .\scripts\generate-code128-label-calibration.js
```

Arquivo gerado:

```text
dist\etiquetas-code128-calibracao.html
```

Abra o HTML no navegador e imprima em escala 100%.

## 2. Configuracao de impressao

Para etiqueta individual:

- Tamanho: `60mm x 35mm`.
- Margem: `2mm`.
- Escala: `100%`.
- Desativar `ajustar a pagina`.
- Desativar cabecalho/rodape do navegador.

Para folha A4 em lote:

- Papel: A4.
- Escala: `100%`.
- Conferir grade de 3 colunas de 60mm.

## 3. Codigos de teste

A folha de calibracao gera estes exemplos:

- `7891000100012`
- `SKU-TESTE-001`
- `PROD 123 ABC`
- `CX-0000000001`
- `NEXUS-ONE-60X35`
- `SEM-CODIGO`

O leitor fisico deve retornar exatamente o texto impresso abaixo do codigo de barras.

## 4. Teste no Nexus One

1. Abra a aba Estoque.
2. Cadastre ou selecione produtos com os codigos acima.
3. Imprima etiqueta individual.
4. Imprima lote de etiquetas.
5. No PDV/Caixa, foque o campo de produto.
6. Leia a etiqueta com o leitor fisico.
7. Confirme se o produto correto entra no carrinho.

## 5. Checklist de aceite

- A etiqueta individual ocupa uma unica pagina 60mm x 35mm.
- O texto do produto nao invade o codigo de barras.
- O preco e o codigo ficam legiveis.
- O leitor retorna exatamente o codigo impresso.
- O PDV encontra o produto pelo codigo lido.
- A impressao em lote respeita 3 colunas em A4.
- A leitura funciona a pelo menos 10 tentativas seguidas por codigo.

## 6. Problemas comuns

- Se a leitura falhar, reduza velocidade/densidade da impressora ou aumente contraste.
- Se a etiqueta quebrar em duas paginas, conferir escala 100% e tamanho 60mm x 35mm.
- Se o leitor inserir caracteres extras, revisar configuracao de sufixo/prefixo do leitor.
- Se o PDV nao localizar produto, conferir se o campo `codigoBarras` do produto esta igual ao texto lido.
