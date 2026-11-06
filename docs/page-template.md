# Modelo de página CentAtlas

Toda página em `site/` segue este molde. O texto fica no HTML de cada idioma; o JS só calcula e formata. `npm run check` confere as partes obrigatórias.

## `<head>`

```html
<!doctype html>
<html lang="en"><!-- ou pt-BR -->
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Daily travel budget · CentAtlas</title>
<meta name="description" content="…">
<link rel="canonical" href="https://pocketparity.pages.dev/travel-budget/">
<link rel="alternate" hreflang="en" href="/travel-budget/">
<link rel="alternate" hreflang="pt-BR" href="/pt/orcamento-de-viagem/">
<link rel="alternate" hreflang="x-default" href="/travel-budget/">
<script>try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Serif:wght@500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap">
<link rel="stylesheet" href="/assets/centatlas.css">
</head>
```

## Cabeçalho

```html
<header class="top">
  <a class="logo" href="/">Cent<span>·</span>Atlas</a>        <!-- /pt/ nas páginas em português -->
  <span class="crumb">/ Travel money</span>
  <nav class="nav">
    <label class="visually-hidden" for="theme">Theme</label>
    <select id="theme">
      <option value="light">Light</option><option value="dark">Dark</option><option value="sepia">Sepia</option>
      <option value="contrast">High contrast</option><option value="sheet">Spreadsheet</option>
      <option value="terminal">Terminal</option><option value="ledger">Ledger</option>
    </select>
    <a class="pill" href="/pt/orcamento-de-viagem/" hreflang="pt-BR" lang="pt-BR">PT</a>
  </nav>
</header>
```

Rótulos em português: Claro, Escuro, Sépia, Alto contraste, Planilha, Terminal, Livro-caixa; botão `EN`.

## Estados dos dados

O `<main>` recebe `data-state` (`loading`, `slow`, `error`, `offline`, `ready`) de `trackStatus`. Tudo que depende de dados leva a classe `needs-data` e só aparece em `ready`.

```html
<main class="wrap" data-state="loading">
  <div class="when-loading" aria-hidden="true"><span class="skeleton big"></span><span class="skeleton"></span></div>
  <p class="status when-slow" role="status">Official data is taking longer than usual to load…</p>
  <div class="status when-error" role="alert">
    Can't reach the official data sources right now. Check your connection.
    <br><button class="btn" type="button" data-retry>Try again</button>
  </div>
  …
</main>
```

Em português: "Os dados oficiais estão demorando mais que o normal…", "Não foi possível acessar as fontes oficiais agora. Verifique sua conexão." e "Tentar de novo".

## Rodapé

```html
<footer class="foot">CentAtlas · Free money tools built on official data. Not financial advice.</footer>
```

Em português: "CentAtlas · Ferramentas gratuitas com dados oficiais. Não é recomendação financeira."
