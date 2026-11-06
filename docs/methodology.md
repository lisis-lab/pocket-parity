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
