# Contexto para o Claude

Projeto de sites de ferramentas financeiras monetizados por AdSense. Público inicial: inglês (EUA/Europa, RPM alto); depois português.

## Regras
- Site estático puro em `site/` (sem framework, sem build). Cada ferramenta numa pasta própria com `index.html`.
- Toda fórmula deve estar documentada em `docs/methodology.md` antes de ir para o site.
- Decisões relevantes vão em `docs/decisions.md` (data, decisão, motivo).
- Dados vêm só de fontes oficiais (Eurostat, World Bank ICP, BEA, BLS, ECB, FRED, BCB, IBGE). Nunca inventar números; dados provisórios devem ser marcados como ilustrativos na página.
- Pipeline em Python 3.11+, saída em `site/data/*.json`.

## Pocket Parity — fórmulas
- `E` = câmbio (moeda destino por unidade da moeda de origem); `P` = nível de preços (EUA = 100).
- Dinheiro recebido: `A × E`. Nível relativo: `R = P_dest / P_orig`.
- "Vai parecer": `A / R`. "Para gastar como em casa": `A × R`.
- Por item: `preço × E × P_dest,cat / P_orig,cat` (restaurantes e hotéis, alimentação, transporte, lazer e cultura, vestuário).
