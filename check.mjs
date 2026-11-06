// Audita o site estático em site/ (sem dependências, sem build).
// Uso: npm run check  (o mesmo que a Action Verificar roda em todo PR)
//
// Para cada página (todo .html em site/):
//   - <html lang>, <title>, <meta name="description">, <meta name="viewport">
//   - carrega /assets/centatlas.css e tem o seletor de tema <select id="theme">
//   - hreflang para en, pt-BR e x-default; cada alvo existe e o par aponta de volta
//   - links e recursos internos apontam para arquivos que existem
// Para cada .js em site/: nenhum dado embutido (regra "sem dados, sem número").
// Toda pasta em site/ (menos assets/) precisa ter index.html.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

function listar(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? [caminho, ...listar(caminho)] : [caminho];
  });
}

export function audit(root) {
  const raiz = resolve(root);
  const erros = [];
  const itens = listar(raiz);
  const rel = (p) => relative(raiz, p).split(sep).join('/');
  const paginas = itens.filter((p) => p.endsWith('.html'));

  for (const pasta of itens.filter((p) => statSync(p).isDirectory())) {
    const r = rel(pasta);
    if (r === 'assets' || r.startsWith('assets/')) continue;
    if (!existsSync(join(pasta, 'index.html'))) erros.push(`${r}/: pasta sem index.html`);
  }

  // URL do site (/pt/x/) -> arquivo
  const arquivoDe = (url) => {
    const limpo = decodeURI(url.split(/[?#]/)[0]);
    let alvo = limpo.startsWith('/') ? join(raiz, limpo) : null;
    if (!alvo) return null;
    if (limpo.endsWith('/') || (existsSync(alvo) && statSync(alvo).isDirectory())) alvo = join(alvo, 'index.html');
    return alvo;
  };
  const hreflangs = (html) => Object.fromEntries(
    [...html.matchAll(/<link[^>]+hreflang="([^"]+)"[^>]*href="([^"]+)"/gi)].map((m) => [m[1], m[2]]));

  for (const pagina of paginas) {
    const nome = rel(pagina);
    const html = readFileSync(pagina, 'utf8');
    const exigir = (regex, oQue) => { if (!regex.test(html)) erros.push(`${nome}: falta ${oQue}`); };
    exigir(/<html[^>]*\slang="[^"]+"/i, '<html lang="...">');
    exigir(/<title>[^<]+<\/title>/i, '<title>');
    exigir(/<meta\s+name="description"\s+content="[^"]+"/i, '<meta name="description">');
    exigir(/<meta\s+name="viewport"/i, '<meta name="viewport">');
    exigir(/<link\s+rel="stylesheet"\s+href="\/assets\/centatlas\.css"/i, '/assets/centatlas.css');
    exigir(/<select[^>]*\sid="theme"/i, 'o seletor de tema <select id="theme">');

    const hl = hreflangs(html);
    const lang = (html.match(/<html[^>]*\slang="([^"]+)"/i) || [])[1];
    const parLang = lang === 'pt-BR' ? 'en' : 'pt-BR';
    for (const k of ['en', 'pt-BR', 'x-default']) {
      if (!hl[k]) { erros.push(`${nome}: falta hreflang="${k}"`); continue; }
      const alvo = arquivoDe(hl[k]);
      if (!alvo || !existsSync(alvo)) erros.push(`${nome}: hreflang="${k}" aponta para "${hl[k]}", que não existe`);
    }
    if (hl[parLang]) {
      const par = arquivoDe(hl[parLang]);
      if (par && existsSync(par)) {
        const volta = hreflangs(readFileSync(par, 'utf8'))[lang];
        const eu = volta && arquivoDe(volta);
        if (!eu || resolve(eu) !== resolve(pagina)) erros.push(`${nome}: o par "${hl[parLang]}" não aponta de volta (hreflang="${lang}")`);
      }
    }

    for (const [, url] of html.matchAll(/\s(?:href|src)="([^"]*)"/gi)) {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|$)/i.test(url)) continue;
      const limpo = decodeURI(url.split(/[?#]/)[0]);
      if (!limpo) continue;
      let alvo = limpo.startsWith('/') ? join(raiz, limpo) : resolve(dirname(pagina), limpo);
      if (limpo.endsWith('/') || (existsSync(alvo) && statSync(alvo).isDirectory())) alvo = join(alvo, 'index.html');
      if (!alvo.startsWith(raiz)) erros.push(`${nome}: link "${url}" sai de site/`);
      else if (!existsSync(alvo)) erros.push(`${nome}: link quebrado "${url}"`);
    }
  }

  for (const js of itens.filter((p) => p.endsWith('.js'))) {
    const src = readFileSync(js, 'utf8');
    if (/\brate:\s*\d/.test(src) || /\bP:\s*\{/.test(src)) erros.push(`${rel(js)}: embedded data (números de câmbio ou nível de preço no código)`);
  }
  return erros;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), 'site');
  const erros = audit(raiz);
  const total = listar(raiz).filter((p) => p.endsWith('.html')).length;
  if (erros.length) {
    console.error(`✗ ${erros.length} problema(s):\n  ` + erros.join('\n  '));
    process.exit(1);
  }
  console.log(`✓ ${total} página(s) auditada(s) em site/, nenhum problema.`);
}
