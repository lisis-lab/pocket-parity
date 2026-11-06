# CentAtlas

Ferramentas de dinheiro com a conta à mostra e dados oficiais. Marca provisória; o repositório (`lisis-lab/pocket-parity`) e o projeto no Cloudflare (`pocketparity`) mantêm os nomes.

Site: https://pocketparity.pages.dev (inglês na raiz, português em `/pt/`).

| Ferramenta | EN | PT | Dados (buscados no navegador) |
|---|---|---|---|
| Pocket Parity | `site/pocket-parity/` | `site/pt/pocket-parity/` | Banco Mundial ICP 2021 + câmbio BCE |
| Orçamento diário de viagem | `site/travel-budget/` | `site/pt/orcamento-de-viagem/` | ICP 2021 por categoria + BCE |
| Cartão ou dinheiro | `site/card-vs-cash/` | `site/pt/cartao-ou-dinheiro/` | câmbio BCE + taxas informadas pelo usuário |
| Calculadora de inflação | `site/inflation-calculator/` | `site/pt/calculadora-de-inflacao/` | Banco Mundial + BLS (EUA) / IBGE IPCA (Brasil) |

## Estrutura

```
site/                 site estático (HTML/CSS/JS puro, sem build)
  assets/centatlas.css    estilos e 7 temas
  assets/js/              formatação, países, dados, cálculos (calc/) e páginas (ui/)
docs/                 metodologia, decisões, fluxo de branches, template de página
tests/                testes (node --test), fixtures das APIs oficiais
check.mjs             auditoria do site (pares hreflang, temas, sem números embutidos)
```

Nesta versão os dados oficiais são buscados ao vivo no navegador, sem servidor. Se uma fonte não responde, a página mostra um aviso de lentidão ou offline e **não exibe números**.

## Rodar localmente

```bash
python -m http.server 8000 -d site
npm run check
```

## Quem faz o quê

- **Marlon**: metodologia financeira, índices de preços, revisão dos números (`docs/`).
- **Leonidas**: site, dados, deploy.
