# CentAtlas — DEV_CONTEXT_MASTER

> **Revisão:** 2026-11-16 · **Versão no ar:** 0.2.0 em https://pocketparity.pages.dev (4 ferramentas, dados ao vivo) — [handoff](./handoff.md)
> **Em progresso / próximo:** **LAUNCH-01** escolher nome e comprar domínio → **LAUNCH-02** aviso + contato + changelog → publicar no domínio → **SEO-01** + **ADS-01** + **CONT-01** antes do pedido ao AdSense. Em paralelo: **UX-TIP-01** (textos com o Marlon).
> **Origem da fila atual:** [conversa com o Marlon 2026-11-15](./conversas/2026-11-15-marlon-feedback-site.md) e [ideias e prontidão para o AdSense 2026-11-16](./conversas/2026-11-16-ideias-e-prontidao-adsense.md) (inclui por que o Codekitto foi recusado).

---

## 0. Regras de manutenção

| # | Regra |
|---|-------|
| 1 | Este arquivo é **enxuto**: estado atual, fila aberta, reservatório, referências. Detalhe vai na spec ou no histórico. |
| 2 | **§3** só tem itens **abertos** (máx. ~8). Ao fechar: sai da tabela e entra uma linha curta no §5. |
| 3 | Toda tarefa tem **ID** e aponta para uma spec. Sem spec ainda → "spec: a escrever" com o caminho previsto em `docs/superpowers/specs/`. |
| 4 | O cabeçalho «Em progresso / próximo» mostra o **próximo trabalho real**. |
| 5 | Conversas e feedback ficam em `docs/conversas/AAAA-MM-DD-*.md`; decisões em [decisions.md](./decisions.md); fórmulas em [methodology.md](./methodology.md). |

### Legenda de tags

| Tag | Significado |
|-----|-------------|
| 🟢 **PRONTO** | Pode começar já |
| 🟡 **PRÉ-ADSENSE** | Ideal antes de pedir aprovação no AdSense |
| 🔴 **BLOQUEADO** | Espera decisão, terceiro ou conflito com uma regra |
| ⚪ **DEPOIS** | Fora da próxima rodada |
| 🧑 **HUMANO** | Decisão ou ação de pessoa (compra, conta, revisão), não código |

---

## 1. Regras fixas

Resumo; o canônico é o [CLAUDE.md](../CLAUDE.md).

| Tema | Regra |
|------|-------|
| Site | Estático puro em `site/`, sem framework nem build. Uma pasta por ferramenta com `index.html`. EN na raiz, PT em `/pt/`. |
| Fórmulas | Documentadas em [methodology.md](./methodology.md) **antes** de ir para o site. |
| Dados | Só fontes oficiais (Eurostat, World Bank ICP, BEA, BLS, ECB, FRED, BCB, IBGE). Buscados ao vivo no navegador, cache de 24 h. Sem dado, sem número. |
| Branches | `feat/*` → `develop` → `release-*` → `main` — [fluxo-de-branches.md](./fluxo-de-branches.md) |
| Testes | `npm run check` |

---

## 2. Mapa rápido (onde mexer)

| Área | Local |
|------|-------|
| Página inicial | `site/index.html`, `site/pt/index.html` |
| Pocket Parity | `site/pocket-parity/`, `site/pt/pocket-parity/` |
| Orçamento diário | `site/travel-budget/`, `site/pt/orcamento-de-viagem/` |
| Cartão ou dinheiro | `site/card-vs-cash/`, `site/pt/cartao-ou-dinheiro/` |
| Inflação | `site/inflation-calculator/` (CPI EUA), `site/pt/calculadora-de-inflacao/` (IPCA) |
| CSS, JS e dados compartilhados | `site/assets/` |
| Modelo de página nova | [page-template.md](./page-template.md) |

---

## 3. Fila ativa

| Ordem | ID | Tag | Item | Estado | Próximo passo / spec |
|------:|----|-----|------|--------|----------------------|
| 1 | **LAUNCH-01** | 🧑 🟢 | Escolher o nome definitivo, comprar o domínio e apontar para o Cloudflare Pages | aberto | Decidir entre as 3 sugestões enviadas ao Marlon (CentAtlas provisório). Candidatos .com livres em 06/11: centatlas.com, parityatlas.com, pocketfintools.com, getpocketparity.com — rechecar. Registrar em [decisions.md](./decisions.md). |
| 2 | **OPS-01** | 🧑 🟢 | Secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` no GitHub para a Action "Publicar" | aberto | [handoff § Próximos passos](./handoff.md#próximos-passos) |
| 3 | **LAUNCH-02** | 🟢 🟡 | Aviso "site em atualização", e-mail de contato/sugestões e página de changelog (EN + PT) | aberto | spec: a escrever — `superpowers/specs/2026-11-15-launch-02-aviso-contato-changelog.md`. Definir o endereço de e-mail (depende do domínio). |
| 4 | **UX-TIP-01** | 🟢 🟡 | Ícone (i) com explicação ao clicar nos resultados do Pocket Parity ("vai parecer", "para gastar como em casa", "equivalente em casa") e nas demais ferramentas | aberto | spec: a escrever — `superpowers/specs/2026-11-15-ux-tip-01-explicacoes.md`. Textos escritos pelo Leonidas e validados pelo Marlon; acessível por teclado e toque. |
| 5 | **VIS-01** | 🟢 | Visual com identidade própria, sem "cara de Claude" | aberto | spec: a escrever. Ponto de partida: [redesign 2026-11-06](./superpowers/specs/2026-11-06-centatlas-redesign-design.md). Não bloqueia a publicação. |
| 6 | **SEO-01** | 🟡 | Páginas de privacidade, sobre, contato e termos (ligadas no rodapé); página do autor (Lattes do Marlon) e "revisado por" em cada ferramenta (finanças é YMYL); página pública de metodologia com fontes e data do dado | aberto | [handoff § Próximos passos](./handoff.md#próximos-passos) · [conversa 2026-11-16 §2](./conversas/2026-11-16-ideias-e-prontidao-adsense.md#2-como-o-centatlas-estava-em-2026-11-16) |
| 7 | **CONT-01** | 🟡 | Texto de 600–1.000 palavras em cada ferramenta (EN e pt-BR): exemplo resolvido, quando usar, limites do método, perguntas próprias. Sem molde repetido (motivo da recusa do Codekitto); o texto fixo precisa ter valor mesmo se os dados ao vivo falharem | aberto | spec: a escrever — `superpowers/specs/2026-11-16-cont-01-textos.md`. Regras do Codekitto: `AGENTS.md` › "Textos que o AdSense aceita". |
| 8 | **ADS-01** | 🟡 | Técnico do AdSense: `ads.txt`, `robots.txt`, `sitemap.xml`, 404; canonical no domínio; hreflang com endereço completo; conferir o limite diário do BLS por IP (robô do Google); consentimento "Privacy & messaging" (TCF) para a Europa; espaço dos anúncios reservado no CSS e longe de botões e campos. **Pedido:** só com o domínio com 4–8 semanas e cliques diários no Search Console | aberto | [conversa 2026-11-16 §2](./conversas/2026-11-16-ideias-e-prontidao-adsense.md#2-como-o-centatlas-estava-em-2026-11-16). Depende de LAUNCH-01. |
| 9 | **MET-01** | 🧑 | Marlon revisa [methodology.md](./methodology.md), principalmente a extrapolação entre benchmarks | aberto | [handoff § Próximos passos](./handoff.md#próximos-passos) |

---

## 4. Reservatório (próximas rodadas)

| ID | Tag | Item | Notas / spec |
|----|-----|------|--------------|
| **I18N-01** | ⚪ | Seis idiomas: inglês e pt-BR (já existem), **pt-PT**, **francês**, **espanhol** e **alemão**. hreflang `en`, `pt-BR`, `pt-PT`, `fr`, `es`, `de` (`x-default` = en). pt-PT com vocabulário próprio, euro e HICP de Portugal; moeda e país padrão por idioma; texto revisado por falante, sem tradução automática crua | spec: a escrever — `superpowers/specs/2026-11-16-i18n-01-idiomas.md`. Decidir os caminhos (`/pt/` fica pt-BR?). Fazer depois de CONT-01, para não multiplicar páginas fracas. [conversa 2026-11-16 §5](./conversas/2026-11-16-ideias-e-prontidao-adsense.md#5-idiomas-pedido-do-leonidas) |
| **FIN-INTL-01** | ⚪ | Finanças pessoais para outros países (hoje a versão PT da inflação usa só IPCA; a EN usa CPI dos EUA). Inflação para qualquer país: Banco Mundial (CPI anual, ~190 países) e Eurostat (HICP mensal) | spec: a escrever. Escolher fontes oficiais por país e documentar em [methodology.md](./methodology.md). Prioridade alta entre as ferramentas novas. |
| **TOOL-FXFEE** | ⚪ | **Quanto o banco me cobrou no câmbio**: compra no exterior + valor cobrado + data → spread contra a taxa de referência do BCE do dia; aceita colar várias linhas da fatura | spec: a escrever. Primeira ferramenta nova sugerida. [conversa 2026-11-16 §3](./conversas/2026-11-16-ideias-e-prontidao-adsense.md#3-ideias-de-ferramentas) |
| **TOOL-REMIT** | ⚪ | Custo real da remessa internacional, comparado com a média do par de países (Banco Mundial, *Remittance Prices Worldwide*) | spec: a escrever. Conferir se o RPW tem acesso que funcione no navegador. |
| **TOOL-SALARY** | ⚪ | Comparador de salário entre países ajustado por paridade de poder de compra (ICP, Eurostat, BCE) | spec: a escrever. Mesma base do Pocket Parity. |
| **TOOL-REAL** | ⚪ | Rendimento real: retorno nominal menos a inflação do país | spec: a escrever. Só cálculo, sem recomendação de investimento. |
| **TOOL-CURLOSS** | ⚪ | Perda de poder de compra da moeda desde um ano escolhido, com gráfico | spec: a escrever |
| **TOOL-MULTICITY** | ⚪ | Orçamento de viagem com várias cidades (N destinos, dias em cada um, total por categoria) | spec: a escrever. Ampliação do orçamento diário. |
| **TOOL-LOAN** | ⚪ | Simulador de financiamento com tabela de parcelas e o juro médio oficial do país (BCE MFI, FRED, BCB) | spec: a escrever |
| **UX-SHARE-01** | ⚪ | Links que guardam o cálculo (só valores e países), data do dado em cada resultado, exportar CSV/imprimir | spec: a escrever |
| **EMBED-01** | ⚪ | Widget para blogs de viagem incorporarem, sem anúncios, com link de volta | spec: a escrever |
| **TRANS-01** | 🔴 | Ferramenta de transporte: comparar avião e ônibus entre cidades por custo, tempo e horário | spec: a escrever. **Conflita com a regra de dados oficiais**: preços de passagem viriam de API comercial (Google ou outra), não de fonte oficial. Precisa de decisão em [decisions.md](./decisions.md) antes. Não copiar dados de outro site. |
| **DATA-01** | ⚪ | Trocar o ICP 2021 pelo Eurostat 2023+ (`prc_ppp_ind`) onde houver; avaliar servidor leve para cachear as fontes (tira o limite do BLS) | Depende de MET-01. [handoff](./handoff.md#próximos-passos) |

---

## 5. Concluídos recentes

| Data | Item |
|------|------|
| 2026-11-06 | 0.2.0: marca CentAtlas, 7 temas, 4 ferramentas, dados oficiais ao vivo, EN/PT — [plano](./superpowers/plans/2026-11-06-centatlas-redesign.md) · [spec](./superpowers/specs/2026-11-06-centatlas-redesign-design.md) |

---

## 6. Referências

| Tópico | Arquivo |
|--------|---------|
| Regras do projeto | [CLAUDE.md](../CLAUDE.md) |
| Histórico e estado da 0.2.0 | [handoff.md](./handoff.md) |
| Decisões | [decisions.md](./decisions.md) |
| Fórmulas e fontes | [methodology.md](./methodology.md) |
| Modelo de página | [page-template.md](./page-template.md) |
| Branches | [fluxo-de-branches.md](./fluxo-de-branches.md) |
| Specs | [superpowers/specs/](./superpowers/specs/) |
| Planos | [superpowers/plans/](./superpowers/plans/) |
| Conversas e feedback | [conversas/](./conversas/) |
