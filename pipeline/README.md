# Pipeline de dados

Gera `site/data/price-levels.json` a partir de fontes oficiais.

```bash
pip install -r requirements.txt
python build_data.py
```

Status: esqueleto. Ainda não baixa dados; o site usa a tabela ilustrativa embutida em `site/pocket-parity/index.html`.
