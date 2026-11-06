# Fluxo de branches do Pocket Parity

O mesmo fluxo do Codekitto e do Utilverso. Nada entra direto em `develop` nem em `main`: toda mudança nasce numa branch própria e entra por pull request (PR). O site só é publicado quando um PR de `release-*` é aceito na `main`.

```
feat/nova-ferramenta ─┐
fix/erro-no-calculo ──┼─ PR ─>  develop  ──>  release-0.2.0  ─ PR (merge) ─>  main  ──>  pocketparity.pages.dev
docs/metodologia ─────┘                                                        │
                                    develop  <──────── PR de sincronização ────┘
```

| Branch | Para que serve | Publica? |
|---|---|---|
| `main` | O que está no ar. Só recebe PR de `release-*`. | **Sim**: o merge de uma `release-*` publica em https://pocketparity.pages.dev |
| `release-X.Y.Z` | Um pacote de mudanças pronto para ir ao ar. Sai de `develop`. | Não |
| `develop` | Junta as mudanças prontas. Branch padrão do repositório. | Não |
| `feat/…`, `fix/…`, `chore/…`, `docs/…` | Uma mudança cada. Sai de `develop` e volta para `develop` por PR. | Não |

## Actions

| Action | Quando roda | O que faz |
|---|---|---|
| **Verificar** (`verificar.yml`) | Todo PR para `develop`, `main` ou `release-*` | Confere o fluxo (`main` só aceita `release-*`; `release-*` só aceita `develop` ou `fix/*`) e roda `npm run check` |
| **Publicar** (`publicar.yml`) | Merge de `release-*` na `main`, ou à mão (Actions > Publicar > Run workflow, branch `main`) | Audita e envia a pasta `site/` ao Cloudflare Pages (projeto `pocketparity`) |
| **Fila de publicação** (`fila-de-publicacao.yml`) | Toda terça às 10h (Brasília), ou à mão | Publica sozinho o PR de release com a linha `Publicar em: AAAA-MM-DD` cuja data já chegou: merge, tag `vX.Y.Z`, Publicar e cópia no Wayback Machine |

`npm run check` (arquivo `check.mjs`, sem dependências) exige em toda página de `site/`: `<html lang>`, `<title>`, `<meta name="description">`, `<meta name="viewport">` e links internos que existam.

## Passo a passo resumido

```bash
git checkout develop
```

```bash
git pull
```

```bash
git checkout -b feat/nome-da-mudanca
```

Trabalhe, rode `npm run check`, faça commit e push e abra o PR para a `develop`:

```bash
gh pr create --base develop --fill
```

Para publicar, crie a release a partir da `develop` e abra o PR para a `main`:

```bash
git checkout -b release-0.2.0
```

```bash
git push -u origin release-0.2.0
```

```bash
gh pr create --base main --head release-0.2.0 --title "Release 0.2.0" --fill
```

Com o ✓ verde, faça o merge com **Create a merge commit**. Depois marque a tag (`git tag -a v0.2.0 -m "Pocket Parity 0.2.0"` e `git push origin v0.2.0`). Para agendar em vez de publicar na hora, ponha `Publicar em: AAAA-MM-DD` na descrição do PR e não faça o merge.

Detalhes (correção urgente, release que passa na frente, tipos de merge): iguais ao Codekitto, em `lisis-lab/codekitto` › `docs/fluxo-de-branches.md`.

## Secrets

`CLOUDFLARE_API_TOKEN` (permissão "Cloudflare Pages: Edit") e `CLOUDFLARE_ACCOUNT_ID`, em Settings > Secrets and variables > Actions. Sem eles a Publicar audita mas não envia.
