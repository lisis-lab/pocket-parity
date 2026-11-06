# Handoff — continuação da conversa na nuvem

> Para o Claude Code local: este arquivo resume a conversa em que o projeto nasceu. Leia junto com `CLAUDE.md`.

## Histórico
- O Marlon (irmão do Leonidas, professor de matemática financeira, especialista em índices de preços) teve a ideia em uma conversa com o Claude: sites de ferramentas financeiras úteis, monetizados com AdSense, com foco em público de língua inglesa (RPM mais alto).
- Ideia escolhida para começar: **Pocket Parity**, um conversor para turistas. O usuário informa quanto vai levar na moeda de casa e o app mostra:
  1. quanto recebe no câmbio;
  2. quanto isso "vale" em poder de compra (ex.: "seus US$ 5.000 vão parecer US$ 3.333 na Suíça");
  3. quanto precisaria levar para manter o padrão de casa;
  4. preço por tipo de gasto (jantar, hotel, mercado, transporte, museu, roupa) usando o nível de preços **da categoria**.
- Formato pedido pelo Marlon: página única, com seletores de origem e destino.
- A ferramenta não será a única: o site usa a marca **CentAtlas** (provisória; a organização GitHub continua `lisis-lab`), com uma pasta por ferramenta em `site/`.

## Estado atual (2026-11-06, versão 0.2.0)
- Site **CentAtlas** com identidade própria ("planilha do planejador", elegante), 7 temas (claro, escuro, sépia, alto contraste, planilha, terminal, livro-caixa), páginas em inglês (raiz) e português (`/pt/`) com hreflang.
- Página inicial com mini calculadora (Pocket Parity resumido) e 4 ferramentas:
  - **Pocket Parity** (`/pocket-parity/`, `/pt/pocket-parity/`);
  - **Orçamento diário de viagem** (`/travel-budget/`, `/pt/orcamento-de-viagem/`);
  - **Cartão ou dinheiro** (`/card-vs-cash/`, `/pt/cartao-ou-dinheiro/`) — funciona também com câmbio digitado, mesmo offline;
  - **Calculadora de inflação** (`/inflation-calculator/` com CPI dos EUA, `/pt/calculadora-de-inflacao/` com IPCA).
- Dados oficiais buscados **ao vivo no navegador** (sem servidor), com cache de 24 h. Sem dado, sem número: aviso de lentidão (6 s) ou de erro/offline com "Tentar de novo". Fontes e fórmulas em `docs/methodology.md`.
- Limites conhecidos das fontes:
  - ICP 2021 é o benchmark mais recente do Banco Mundial (dados de 2021); a API avançada não tem CORS, por isso é lida via JSONP.
  - BLS API v1 (sem chave): só os 3 últimos anos por consulta e 25 consultas/dia por IP do visitante — o cache de 24 h amortece. Se o limite estourar, a calculadora dos EUA mostra o aviso de erro.
  - IPCA a partir de 1995 (Plano Real).
- Testes: `npm run check` (node --test + auditoria `check.mjs`).
- Repositório: https://github.com/lisis-lab/pocket-parity (público). Branches: `feat/*` → `develop` → `release-*` → `main` (ver `docs/fluxo-de-branches.md`).
- Site no ar: https://pocketparity.pages.dev — Cloudflare Pages, projeto `pocketparity`. A Action "Publicar" precisa dos secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` (ainda **não configurados**); enquanto isso, publicar à mão: `npx wrangler@4 pages deploy site --project-name pocketparity --branch main` com as variáveis no ambiente (nunca no repositório).
- `pipeline/`: esqueleto antigo, não usado nesta versão.
- Domínios .com livres em 06/11/2026 (RDAP da Verisign): pocketfintools.com, centatlas.com, parityatlas.com, getpocketparity.com, lisislab.com. `pocketparity.com` já tem dono.

## Próximos passos
1. Configurar os secrets do Cloudflare no GitHub para a Action publicar sozinha.
2. O Marlon valida o site e revisa `docs/methodology.md`, principalmente a regra de extrapolação entre benchmarks.
3. Trocar o ICP 2021 pelo Eurostat 2023+ (`prc_ppp_ind`) onde houver, com a regra de extrapolação do Marlon; avaliar um servidor/pipeline leve para cachear as fontes (tira o limite do BLS).
4. Domínio próprio (a marca CentAtlas ainda é provisória).
5. Páginas de apoio para SEO ("Is Switzerland expensive for Americans?" etc.), política de privacidade, "sobre o autor" (com link para o Lattes do Marlon) e o pedido de aprovação no AdSense.
