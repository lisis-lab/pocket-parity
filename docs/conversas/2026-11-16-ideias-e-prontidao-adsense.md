# Ideias de ferramentas e prontidão para o AdSense (2026-11-16)

> Conversa do Leonidas com o Claude. Pedido: ideias de ferramentas e melhorias, site pronto para o AdSense sem repetir os erros do Codekitto, ferramentas de finanças que valham no mundo todo e que não sejam substituíveis por IA. Depois: acrescentar os idiomas pt-BR, pt-PT, francês, inglês, espanhol e alemão. Tarefas geradas estão no [DEV_CONTEXT_MASTER](../DEV_CONTEXT_MASTER.md) (§3 e §4).

## 1. Por que o Codekitto foi recusado

Fonte: `lisis-lab/codekitto` › `docs/tarefas-codekitto.md` (T5.28) e `AGENTS.md` ("Textos que o AdSense aceita").

Recusado em 03/11/2026 por **"Low value content"**:

1. **Site novo e com poucas visitas.** Foi a causa principal (no ar desde 24/10/2026).
2. **Páginas que eram quase só menu.** As de categoria tinham ~300 palavras, quase tudo links.
3. **Texto em molde repetido.** As mesmas perguntas frequentes em várias ferramentas ("os dados vão ao servidor?", "quantos posso gerar?").

Ter 32 ferramentas no ar não evitou a recusa. O que conta é texto próprio em cada página e visitas reais.

## 2. Como o CentAtlas estava em 2026-11-16

| Ponto | Situação | O que fazer | Tarefa |
|---|---|---|---|
| Conteúdo por página | 200 a 400 palavras, quase tudo interface | 600 a 1.000 palavras por ferramenta: exemplo resolvido, quando usar, limites do método, perguntas próprias da ferramenta | CONT-01 |
| Política de privacidade, sobre, contato, termos | Não existem; o rodapé tem só uma linha | Criar nos idiomas do site e ligar no rodapé | SEO-01 |
| Autoria | Nenhuma | Finanças é assunto YMYL: página do autor (Lattes do Marlon) e "revisado por" em cada ferramenta | SEO-01 |
| Metodologia | Só em `docs/methodology.md` | Página pública com fórmulas, fontes e data do dado | SEO-01 |
| `ads.txt`, `robots.txt`, `sitemap.xml`, 404 | Não existem em `site/` | Criar | ADS-01 |
| Canonical | Aponta para `pocketparity.pages.dev` | Trocar pelo domínio definitivo | ADS-01 |
| hreflang | Endereços relativos (`/pocket-parity/`) | O Google pede endereço completo | ADS-01 |
| Dados ao vivo para o robô do Google | Se a busca falha, a página fica com o esqueleto vazio | Os textos fixos precisam ter valor sozinhos; conferir o limite diário do BLS por IP (o robô do Google usa IPs compartilhados) | ADS-01 |
| Consentimento na Europa | Nada | Ativar o "Privacy & messaging" do AdSense (CMP certificada TCF, exigida no EEE, Reino Unido e Suíça) | ADS-01 |
| Lugar dos anúncios | Não previsto | Reservar o espaço no CSS (sem a página "pular") e nunca colocar anúncio junto de botões e campos | ADS-01 |
| Idade e tráfego | Domínio ainda não existe | Comprar já, cadastrar no Search Console e só pedir o AdSense com 4 a 8 semanas e cliques todos os dias | LAUNCH-01, ADS-01 |

## 3. Ideias de ferramentas

Critério: finanças, válidas para qualquer país, e que cruzam **dados oficiais atuais** com **números do próprio usuário**. Uma IA não tem a cotação do dia nem o índice do mês, e não processa a fatura do usuário com a taxa oficial daquela data.

| ID | Ferramenta | Dados oficiais | Observação |
|---|---|---|---|
| TOOL-FXFEE | **Quanto o banco me cobrou no câmbio**: valor da compra no exterior + valor cobrado + data → spread escondido contra a taxa de referência do BCE daquele dia. Aceita colar várias linhas da fatura. | BCE (taxas de referência históricas) | A mais forte da lista |
| TOOL-REMIT | **Custo da remessa internacional**: quanto enviou × quanto chegou → custo real, comparado com a média do par de países | Banco Mundial, *Remittance Prices Worldwide*; BCE | Conferir se o RPW tem acesso que funcione no navegador |
| TOOL-SALARY | **Comparador de salário entre países**: proposta em outro país × salário atual, ajustado por paridade de poder de compra | World Bank ICP, Eurostat, BCE | Mesma base do Pocket Parity; tema de mudança de país (RPM alto) |
| FIN-INTL-01 | **Inflação para qualquer país** | Banco Mundial (CPI anual, ~190 países), Eurostat (HICP mensal) | Já estava no reservatório; responde ao pedido do Marlon |
| TOOL-REAL | **Rendimento real**: retorno nominal menos a inflação do país | BLS, Eurostat, IBGE/BCB, Banco Mundial | Só cálculo, sem recomendação de investimento |
| TOOL-CURLOSS | **Perda de poder de compra da moeda** desde um ano escolhido, com gráfico | Banco Mundial, Eurostat, BCE, FRED | |
| TOOL-MULTICITY | **Orçamento de viagem com várias cidades**: N destinos, dias em cada um, total por categoria | World Bank ICP, Eurostat, BCE | Ampliação do orçamento diário |
| TOOL-LOAN | **Seu juro comparado com a média do país**: simulador com tabela de parcelas | BCE (MFI), FRED, BCB | |

**Deixadas de fora:** conversor de moeda comum (concorrência enorme, IA responde) e restituição de IVA para turistas (sem API oficial ao vivo; esbarra na regra de dados).

## 4. Outras melhorias

- **UX-SHARE-01:** links que guardam o cálculo (só valores e países, nunca dado pessoal), data do dado em cada resultado ("BCE, 14/11/2026"), exportar CSV/imprimir.
- **EMBED-01:** widget para blogs de viagem incorporarem, sem anúncios, com link de volta.
- **UX-TIP-01:** ícones (i) com explicação (já na fila).
- **Ritmo:** uma ferramenta nova por semana, como no Codekitto.

## 5. Idiomas (pedido do Leonidas)

Seis versões: **inglês** (já existe), **português do Brasil** (já existe, em `/pt/`), **português de Portugal**, **francês**, **espanhol** e **alemão**. Tarefa I18N-01.

Pontos para a spec:
- Códigos hreflang: `en`, `pt-BR`, `pt-PT`, `fr`, `es`, `de`, com `x-default` no inglês. Decidir os caminhos (ex.: `/pt/` continua pt-BR ou vira `/pt-br/`; `/pt-pt/`, `/fr/`, `/es/`, `/de/`).
- pt-PT não é só ortografia: vocabulário ("ecrã", "telemóvel"), euro como moeda padrão e inflação pelo HICP de Portugal em vez do IPCA.
- Moeda e país padrão por idioma (de/fr/pt-PT → euro e Eurostat; es → Espanha e América Latina).
- Texto revisado por quem fala o idioma, sem tradução automática crua: senão o Google trata como conteúdo de pouco valor, o mesmo motivo da recusa do Codekitto.
- Ordem sugerida: primeiro os textos completos em EN e pt-BR (CONT-01); depois os outros idiomas, para não multiplicar páginas fracas antes do pedido ao AdSense.

## 6. Ordem sugerida

Domínio (LAUNCH-01) → páginas obrigatórias e técnico (SEO-01, ADS-01) → textos das 4 ferramentas atuais (CONT-01) → ferramentas novas, começando por TOOL-FXFEE e FIN-INTL-01 → idiomas (I18N-01).
