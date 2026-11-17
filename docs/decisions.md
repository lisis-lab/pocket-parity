# Registro de decisões

| Data | Decisão | Motivo |
|---|---|---|
| 2026-11-06 | Site estático puro, uma pasta por ferramenta | Hospedagem grátis (Cloudflare Pages/GitHub Pages), zero manutenção de build |
| 2026-11-06 | Pocket Parity em página única com seletores de origem/destino | Pedido do Marlon; mais simples de usar |
| 2026-11-06 | Mostrar câmbio e poder de compra lado a lado, sem "alterar" a conversão | O turista troca no câmbio de mercado; o app mostra o que o dinheiro compra |
| 2026-11-06 | Preços por item usam PLI da categoria | PPC agregada não representa a cesta do turista |
| 2026-11-06 | Protótipo com dados ilustrativos, marcado na página | Validar UX e método antes do pipeline |
| 2026-11-05 | Hospedagem no Cloudflare Pages (projeto `pocketparity`), deploy por upload direto via wrangler | Grátis, CDN global; upload direto não exige integração Git no painel |
| 2026-11-05 | Repositório renomeado para `lisis-lab/pocket-parity` | Nome do repo igual ao da ferramenta |
| 2026-11-06 | Marca do site e dos docs: CentAtlas (provisória); repo e Cloudflare mantêm os nomes | Identidade própria, distinta de Codekitto/Utilverso |
| 2026-11-06 | Visual "planilha do planejador", elegante, 7 temas (claro, escuro, sépia, alto contraste, planilha, terminal, livro-caixa) | Hábitos de planejadores financeiros e de viagem |
| 2026-11-06 | Páginas separadas por idioma (EN na raiz, PT em `/pt/`) com hreflang | SEO e AdSense por idioma |
| 2026-11-06 | Dados oficiais ao vivo no navegador (ICP via JSONP, BCE, Banco Mundial, BLS, SIDRA); sem números de reserva | Sem servidor nesta versão; nunca mostrar número sem fonte |
| 2026-11-06 | Página inicial com mini calculadora no destaque | Mostra o valor do site no primeiro olhar |
| 2026-11-06 | Ferramentas: Pocket Parity, orçamento diário, cartão ou dinheiro, inflação | Mistura de viagem e finanças pessoais |
| 2026-11-15 | Contexto e fila de tarefas em `docs/DEV_CONTEXT_MASTER.md` (formato do Weekeda); feedback em `docs/conversas/` | Um lugar só para o estado atual e o que está aberto, com IDs ligados às specs |
| 2026-11-16 | Idiomas do site: inglês, português do Brasil, português de Portugal, francês, espanhol e alemão (I18N-01); caminhos a definir na spec | Público nos EUA, Europa e América Latina; pt-PT separado do pt-BR por vocabulário, moeda e índice de inflação |
| 2026-11-16 | Ferramentas novas só se cruzam dados oficiais atuais com números do usuário (fora: conversor de moeda comum e o que uma IA responde sozinha) | Não ser substituível por IA e evitar a recusa por "Low value content" que o Codekitto teve |
| 2026-11-16 | Pedir o AdSense só depois de SEO-01, ADS-01 e CONT-01 no ar, com o domínio com 4–8 semanas e cliques diários | Codekitto recusado em 03/11/2026 por site novo, poucas visitas e texto repetido |
