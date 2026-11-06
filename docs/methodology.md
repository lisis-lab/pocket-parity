# Metodologia — Pocket Parity

> Responsável: Marlon. Rascunho inicial a partir da conversa de concepção.

## Pergunta que a ferramenta responde
O câmbio diz quanto dinheiro local o turista recebe; a paridade de poder de compra diz o que esse dinheiro compra.

## Definições
- `A`: valor levado, na moeda de origem.
- `E`: câmbio de referência (moeda de destino por 1 unidade da moeda de origem). Editável pelo usuário.
- `P_c`: nível de preços do país para a categoria `c` (PLI, EUA = 100).
- `R = P_dest / P_orig` (agregado: consumo final das famílias).

## Resultados
1. **No câmbio:** `A × E`.
2. **Vai parecer:** `A / R`, em moeda de origem.
3. **Para manter o padrão de casa:** `A × R`, em moeda de origem (`A × R × E` em moeda local).
4. **Por item:** `p × E × P_dest,c / P_orig,c`.

## Por que categorias
A PPC agregada mede a cesta do residente. O turista gasta sobretudo em restaurantes, hotéis, transporte e lazer, então cada item usa o PLI da sua categoria.

## Fontes previstas
- Eurostat: PLIs por categoria (tabela `prc_ppp_ind`), HICP por categoria.
- World Bank ICP: PLIs por categoria para países fora da Europa.
- Câmbio: taxas de referência do BCE / Fed.

## Pendências
- [ ] Regra de extrapolação entre benchmarks (inflação relativa por categoria).
- [ ] Mapeamento de itens ↔ categorias COICOP.
- [ ] Ajuste regional (ex.: RPP do BEA nos EUA).
- [ ] Substituir os dados ilustrativos do protótipo.

---

# CentAtlas — fontes de dados (versão com busca no navegador)

> Decidido em 2026-11-06: nesta versão os dados oficiais são buscados direto no navegador do visitante (sem servidor). **Sem dados, sem número**: se uma fonte falhar, a página não mostra valor algum, só um aviso de lentidão ou de sem conexão.

## Níveis de preço por categoria
- **Fonte:** World Bank, ICP 2021 (fonte 90 da API), classificação `PX.WL` (índice de nível de preços, Mundo = 100).
- **Rebase para EUA = 100:** `P_c(país) = PX_c(país) / PX_c(EUA) × 100`.
- **Séries:** `all` 9260000 (consumo das famílias sem moradia — o turista não paga aluguel), `rest` 1111000 (restaurantes e hotéis), `food` 1101000 (alimentos e bebidas não alcoólicas), `trans` 1107000 (transporte), `rec` 9110000 (recreação e cultura, consumo individual efetivo), `cloth` 1103000 (vestuário e calçados).
- Um país sem alguma das seis séries fica fora da ferramenta (nunca é completado).
- Limitação conhecida: o benchmark é de 2021. A troca por Eurostat 2023+ e a regra de extrapolação entre benchmarks continuam pendentes (ver acima).

## Câmbio
- **Fonte:** BCE, série `EXR.D.<moeda>.EUR.SP00.A`, última observação diária.
- **Câmbio cruzado:** `E(origem→destino) = (moeda destino por EUR) / (moeda origem por EUR)`.

## Inflação
- **EUA:** World Bank `FP.CPI.TOTL` (CPI anual, 2010 = 100, origem BLS via FMI) até o último ano publicado. Os anos completos mais recentes vêm do BLS (`CUUR0000SA0`, CPI-U), encadeados no último ano do World Bank: `I_ano = I_WB,último × CPI_BLS,ano / CPI_BLS,último`. O valor anual do BLS é a média anual oficial (período M13); sem ela, a média dos 12 meses (o ano só entra se os 12 existirem).
- **Brasil:** IBGE, SIDRA tabela 1737, variável 2266 (IPCA, número-índice, dez/1993 = 100). Valor anual = índice de dezembro. Só de 1995 em diante (antes do Real os valores em moeda não são comparáveis).

## Cache e falhas
- Cada resposta bem-sucedida fica guardada no navegador por 24 h. Depois disso é buscada de novo; cache vencido nunca é exibido.
- Após 6 s sem resposta, aviso de lentidão. Erro, tempo esgotado (20 s) ou sem conexão: nenhum número, aviso e botão "Tentar de novo".

## Orçamento diário de viagem (Daily travel budget)
- Entrada: gasto diário em casa por categoria `h_c` (moeda de casa), número de dias `D` (inteiro ≥ 1), câmbio `E`.
- Por categoria: `R_c = P_dest,c / P_orig,c` e gasto lá `t_c = h_c × E × R_c` (moeda do destino).
- Por dia lá: `Σ t_c`; em moeda de casa: `Σ t_c / E`. Total da viagem: `D × Σ t_c`.
- Comparação com casa: `(Σ t_c / E) / Σ h_c` (sem valor quando `Σ h_c = 0`). Valores negativos ou inválidos contam como 0.
- Valores iniciais sugeridos (editáveis): USD 150 / 20 / 25 / 30 / 15 por dia (hospedagem e restaurantes, supermercado, transporte, lazer, compras), convertidos para a moeda de casa por `USD→casa × P_casa,c / 100` e arredondados. São pontos de partida, não estatística.
