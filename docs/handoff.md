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
- A ferramenta não será a única: o site é a marca guarda-chuva **Lisis Lab** (organização GitHub `lisis-lab`), com uma pasta por ferramenta em `site/`.

## Estado atual
- `site/pocket-parity/index.html`: protótipo funcional, 17 países, **dados ilustrativos** (marcado na página).
- Site teste publicado como artifact (privado): https://claude.ai/artifact/1u4Wo8QWhLii6WdpHtabnv
- `pipeline/build_data.py`: só o esqueleto.
- Domínios .com livres em 06/11/2026 (pelo RDAP da Verisign), caso se queira domínio próprio: pocketfintools.com, centatlas.com, parityatlas.com, getpocketparity.com. `pocketparity.com` já tem dono. **`lisislab.com` também estava livre**, e combina com a marca guarda-chuva.

## Próximos passos
1. Publicar o site (Cloudflare Pages ou GitHub Pages) apontando para `site/`.
2. Convidar o Marlon como colaborador do repositório.
3. Implementar o pipeline: PLIs por categoria do Eurostat (`prc_ppp_ind`) e do World Bank ICP, câmbio de referência do BCE, saída em `site/data/price-levels.json`. Depois fazer a página ler esse JSON em vez da tabela embutida.
4. O Marlon revisa `docs/methodology.md`, principalmente a regra de extrapolação entre benchmarks.
5. Páginas de apoio para SEO ("Is Switzerland expensive for Americans?" etc.), política de privacidade, "sobre o autor" (com link para o Lattes do Marlon) e o pedido de aprovação no AdSense.
