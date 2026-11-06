# Lisis Lab

Ferramentas financeiras úteis, com metodologia transparente e dados oficiais.

| Ferramenta | Pasta | Status |
|---|---|---|
| Pocket Parity — conversor de viagem ajustado ao custo de vida | `site/pocket-parity/` | protótipo (dados ilustrativos) |

## Estrutura

```
site/        site estático (HTML/CSS/JS puro, sem build)
  index.html          página inicial com a lista de ferramentas
  pocket-parity/      ferramenta de paridade para turistas
docs/        metodologia e registro de decisões
pipeline/    scripts Python que baixam dados oficiais e geram JSON para o site
```

## Rodar localmente

```bash
cd site
python -m http.server 8000
# abra http://localhost:8000
```

## Quem faz o quê

- **Marlon** — metodologia financeira, índices de preços, revisão dos números (`docs/`).
- **Leonidas** — site, pipeline de dados, deploy.
