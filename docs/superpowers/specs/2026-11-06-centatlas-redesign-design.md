# CentAtlas: identidade própria, temas e três ferramentas novas

Data: 2026-11-06 · Status: aguardando revisão do Leonidas

## Objetivo

Montar um piloto para mostrar ao Marlon: um site de ferramentas financeiras com identidade própria, que **não** se pareça com o Codekitto nem com o Utilverso. O visual deve ser moderno, intuitivo e elegante, e seguir os hábitos de quem planeja finanças e viagens: tabelas, totais, orçamento por categoria e fontes citadas.

**Critério de sucesso:** o Marlon abre o site no celular ou no computador, usa as quatro ferramentas em inglês ou português, troca de tema e vê em cada uma a fórmula e a fonte dos dados.

### O que o Leonidas pediu (decidido)
- Marca guarda-chuva **CentAtlas**, nome provisório. Só no texto do site e nos docs: o repositório continua `lisis-lab/pocket-parity` e o Cloudflare continua `pocketparity`.
- Visual **B · Planilha do planejador** na versão **v2, elegante**: relatório de private banking.
- Ferramentas misturando viagem e finanças pessoais: **Daily travel budget**, **Card vs. cash** e **Inflation calculator**, além do Pocket Parity.
- **Inglês e português**, um HTML por idioma.
- **Sete temas visuais** escolhidos pelo visitante: Claro, Escuro, Sépia, Alto contraste, Planilha, Terminal e Livro-caixa.
- O topo da página inicial traz uma **mini calculadora** do Pocket Parity que funciona.

### Suposições (corrigir se estiverem erradas)
- O site continua estático, sem build, e o JS é módulo ES puro.
- Os níveis de preço continuam **ilustrativos**, com aviso na página. O pipeline do Eurostat e do ICP fica fora deste trabalho.
- A inflação usa dados oficiais reais desde já: CPI-U do BLS na página em inglês e IPCA do IBGE na página em português.

## Identidade visual

**Estrutura (igual em todos os temas):**
- Topo com o logo "Cent·Atlas", seletor de tema e EN | PT.
- Página de ferramenta: eyebrow da seção, título em serifa, entradas numa coluna lateral (que vai para o topo no celular), resultado principal num cartão "extrato" com o número grande em serifa, e tabela por categoria com barras de nível de preço.
- Embaixo de cada ferramenta, um bloco "How we calculate" (`<details>`) com a fórmula e a fonte.

**Tokens do tema padrão (Claro):** fundo marfim `#faf8f3`, cartão `#ffffff`, tinta `#14261f`, texto secundário `#66756f`, linha `#e7e2d6`, verde-floresta `#1e4d3f` (destaque), latão `#a8823a` (detalhes e fontes), terracota `#b4532a` (mais caro), verde `#1d7a4f` (mais barato).

**Fontes:** Newsreader (títulos e números de destaque), Hanken Grotesk (texto), IBM Plex Mono (números de tabela, `tabular-nums`). Todas vêm do Google Fonts, que o site já usa.

**Temas:** cada tema redefine as variáveis CSS (cores e, quando faz sentido, fontes) em `[data-theme="..."]`.

| Tema | Público | Diferença principal |
|---|---|---|
| `light` (Claro) | todos | tokens acima |
| `dark` (Escuro) | todos | fundo `#101a17`, verde-água `#4fc3a1` |
| `sepia` (Sépia) | todos | papel envelhecido `#f4ecd8`, tinta marrom `#3b2f22` |
| `contrast` (Alto contraste) | acessibilidade | preto no branco, letra 112%, bordas de 2px, foco bem visível |
| `sheet` (Planilha) | planejadores | grade cinza, cabeçalho verde `#217346`, fonte do sistema estilo Calibri/Segoe, célula de total destacada |
| `terminal` (Terminal) | planejadores | âmbar `#ffb000` no preto, tudo em IBM Plex Mono, rótulos em maiúsculas |
| `ledger` (Livro-caixa) | planejadores | papel pautado, IBM Plex Serif, linha dupla nos totais, vermelho-vinho `#7a1f1f` |

**Comportamento do seletor:**
- Sem escolha salva, o site segue `prefers-color-scheme` (Claro ou Escuro).
- A escolha fica em `localStorage`, com leitura e gravação dentro de `try/catch`. Se o armazenamento falhar, a página funciona no tema padrão.
- Um script pequeno inline no `<head>` aplica o tema antes de desenhar a página, para evitar o "piscar".
- O seletor é um `<select>` nativo com rótulos traduzidos, para ser acessível.

**Contraste:** todos os temas precisam de contraste AA (4,5:1) para o texto. Isso é conferido à mão na revisão; o Alto contraste mira AAA.

## Estrutura do site

| Página | EN | PT |
|---|---|---|
| Página inicial | `/` | `/pt/` |
| Pocket Parity | `/pocket-parity/` | `/pt/pocket-parity/` |
| Daily travel budget | `/travel-budget/` | `/pt/orcamento-de-viagem/` |
| Card vs. cash | `/card-vs-cash/` | `/pt/cartao-ou-dinheiro/` |
| Inflation calculator | `/inflation-calculator/` | `/pt/calculadora-de-inflacao/` |

```
site/
  index.html, pt/index.html, <ferramenta>/index.html, pt/<ferramenta>/index.html
  assets/
    centatlas.css          estrutura + 7 temas
    js/
      theme.js             seletor de tema
      format.js            moeda e número via Intl, conforme <html lang>
      countries.js         países, moedas, bandeiras e níveis de preço ilustrativos (hoje dentro do Pocket Parity)
      calc/parity.js       funções puras do Pocket Parity
      calc/budget.js       funções puras do orçamento
      calc/cardcash.js     funções puras de cartão vs. dinheiro
      calc/inflation.js    funções puras da inflação
      ui/<ferramenta>.js   liga o formulário às funções puras
  data/
    cpi-us.json            CPI-U anual (BLS), com fonte e data da coleta
    ipca-br.json           IPCA anual (IBGE), com fonte e data da coleta
```

- O texto fica no HTML de cada idioma. O JS não traduz nada; ele só formata números conforme o `lang` (`en-US` ou `pt-BR`).
- Cada página tem `hreflang` para o par e `x-default` apontando para a versão em inglês. O botão EN | PT leva ao par.
- O Pocket Parity atual (`site/pocket-parity/index.html`, com CSS e JS embutidos) é refeito sobre os arquivos compartilhados, mantendo a lógica e as fórmulas.

## As ferramentas

As fórmulas entram em `docs/methodology.md` **antes** de ir para o site, como manda o CLAUDE.md. Notação: `E` é o câmbio (moeda de destino por 1 da moeda de origem) e `P_c` é o nível de preço da categoria `c`, com EUA = 100.

### Página inicial com mini calculadora
- Entradas: valor e destino. A origem vem do idioma (EUA em inglês, Brasil em português) e pode ser trocada.
- Resposta em frase: "In Switzerland, your $5,000 buys what $3,333 buys at home". Abaixo, a categoria que mais encarece e o botão "Open Pocket Parity →", que leva o valor e o destino na URL (`?amount=5000&to=CH`). O Pocket Parity lê esses parâmetros.
- Embaixo, as seções **Travel money** (3 ferramentas) e **Personal finance** (1), em cartões com a fonte dos dados em latão.

### Pocket Parity (existente, só refeito)
As fórmulas não mudam: `A × E`, `A / R`, `A × R` e o preço por item.

### Daily travel budget
- Entradas:
  - origem, destino, número de dias e câmbio (preenchido, editável);
  - gasto diário em casa, na moeda de origem, por categoria: Hospedagem e restaurantes (`rest`), Supermercado (`food`), Transporte (`trans`), Lazer (`rec`) e Compras (`cloth`).
- Por categoria: `lá_c = casa_c × E × P_dest,c / P_orig,c`, na moeda de destino.
- Saída:
  - tabela com o gasto em casa, a diferença de nível de preço (`P_dest,c / P_orig,c − 1`, em %, com barra) e o valor por dia no destino;
  - total por dia e total da viagem (`× dias`), na moeda de destino e convertido para a de origem (`/ E`);
  - quanto acima ou abaixo de casa: `Σlá_c / E ÷ Σcasa_c − 1`.
- Validação: campos vazios contam como 0, e dias precisa ser inteiro ≥ 1.

### Card vs. cash
Compara o custo, na moeda de origem, de gastar `X` na moeda de destino. `E_mid` é o câmbio comercial.

| Forma | Custo na moeda de origem |
|---|---|
| Referência (câmbio comercial) | `X / E_mid` |
| Cartão | `X / E_mid × (1 + spread_cartão) × (1 + taxa_internacional)` |
| Saque no exterior (ATM) | `X / E_mid × (1 + spread_saque) + tarifa_fixa_banco + tarifa_caixa_local / E_mid` |
| Casa de câmbio | `X / E_mid × (1 + spread_casa)` |

- Saída: tabela com o custo de cada forma, a diferença em relação à referência (valor e %) e a mais barata destacada. Há também um aviso sobre conversão dinâmica de moeda (DCC): recusar pagar na moeda de casa.
- Os valores iniciais são **exemplos editáveis**, marcados como tal, e não afirmam a taxa de nenhum banco. Na página em português, um campo "IOF (%)" soma ao cartão e ao saque, com valor inicial vazio e explicação do que é.

### Inflation calculator
- Entradas: valor, ano de origem e ano de destino (o padrão é o último ano completo disponível).
- Conta: `valor_destino = valor × I_destino / I_origem`, onde `I` é o índice anual. A saída inclui a inflação acumulada (`I_destino / I_origem − 1`) e a média anual (`(I_destino / I_origem)^(1/anos) − 1`).
- Saída: o valor equivalente em destaque, a tabela "ano a ano" resumida (a cada 5 anos) com barras e a fonte com a data da coleta.
- Dados:
  - **EN:** CPI-U, U.S. city average, all items, 1982–84 = 100 (BLS, série `CUUR0000SA0`), média anual. Só anos completos.
  - **PT:** IPCA (IBGE, SIDRA tabela 1737), número-índice de dezembro de cada ano. Só anos completos.
  - Coleta: `pipeline/fetch_inflation.py` (Python 3.11, `requests`) baixa das APIs oficiais e grava `site/data/*.json` no formato `{source, series, retrieved, base, values: {"2015": 237.017, ...}}`. Se a API falhar, o script para com erro e não grava nada. **Nenhum número é digitado à mão.**

## Verificação

- **Testes:** `node --test` sobre `site/assets/js/calc/*.js`, sem dependências. Cobre cada fórmula com valores calculados à mão: casos de 0, 1 dia e anos iguais. Rodam em `npm test` e passam a fazer parte de `npm run check`.
- **`check.mjs` amplia a auditoria:**
  - toda página tem `hreflang` para o par, e o par aponta de volta;
  - toda página tem o seletor de tema e carrega `centatlas.css`;
  - os JSON de dados existem e têm `source` e `retrieved`.
- **Manual, antes da release:**
  - as quatro ferramentas nos dois idiomas, nos sete temas, em 375 px e no desktop;
  - teclado: tab até o seletor e os campos, com foco visível.

## Fora do escopo
- O pipeline real de níveis de preço (Eurostat e ICP) e a troca dos dados ilustrativos.
- Domínio próprio, AdSense, páginas de política de privacidade e "sobre", e as páginas de SEO.
- Mudar o nome do repositório ou do projeto no Cloudflare.

## Entrega
- Branch `feat/centatlas-redesign` saindo da `develop`, com PR para a `develop`. Depois a `release-0.2.0` vai para a `main`, que publica via Action quando os secrets do Cloudflare estiverem configurados.
- Docs atualizados:
  - `README.md`, `CLAUDE.md` e `docs/handoff.md` passam a dizer CentAtlas, explicando que o nome é provisório;
  - `docs/methodology.md` recebe as três fórmulas novas;
  - `docs/decisions.md` registra marca, visual, temas, idiomas e fontes de inflação.
