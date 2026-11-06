// Audita o site estático em site/ (sem dependências, sem build).
// Uso: npm run check  (o mesmo que a Action Verificar roda em todo PR)
//
// Regras, para cada página (todo arquivo .html dentro de site/):
//   - <html lang="...">, <title>, <meta name="description"> e <meta name="viewport">
//   - links e recursos internos (href/src relativos ou começando com /) apontam para arquivos que existem
// Toda pasta de ferramenta em site/ precisa ter index.html.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "site");
const erros = [];

function listar(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? [caminho, ...listar(caminho)] : [caminho];
  });
}

const itens = listar(RAIZ);
const paginas = itens.filter((p) => p.endsWith(".html"));
const pastas = itens.filter((p) => statSync(p).isDirectory());

for (const pasta of pastas) {
  if (!existsSync(join(pasta, "index.html")) && !relative(RAIZ, pasta).startsWith("data")) {
    erros.push(`${relative(RAIZ, pasta)}/: pasta sem index.html`);
  }
}

function resolverInterno(pagina, url) {
  const limpo = decodeURI(url.split(/[?#]/)[0]);
  if (!limpo) return null;
  let alvo = limpo.startsWith("/") ? join(RAIZ, limpo) : resolve(dirname(pagina), limpo);
  if (limpo.endsWith("/") || (existsSync(alvo) && statSync(alvo).isDirectory())) alvo = join(alvo, "index.html");
  return alvo;
}

for (const pagina of paginas) {
  const nome = relative(RAIZ, pagina).split(sep).join("/");
  const html = readFileSync(pagina, "utf8");
  const exigir = (regex, o_que) => { if (!regex.test(html)) erros.push(`${nome}: falta ${o_que}`); };
  exigir(/<html[^>]*\slang="[^"]+"/i, '<html lang="...">');
  exigir(/<title>[^<]+<\/title>/i, "<title>");
  exigir(/<meta\s+name="description"\s+content="[^"]+"/i, '<meta name="description">');
  exigir(/<meta\s+name="viewport"/i, '<meta name="viewport">');

  for (const [, url] of html.matchAll(/\s(?:href|src)="([^"]*)"/gi)) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|$)/i.test(url)) continue; // externo, âncora ou vazio
    const alvo = resolverInterno(pagina, url);
    if (alvo && !alvo.startsWith(RAIZ)) erros.push(`${nome}: link "${url}" sai de site/`);
    else if (alvo && !existsSync(alvo)) erros.push(`${nome}: link quebrado "${url}"`);
  }
}

if (erros.length) {
  console.error(`✗ ${erros.length} problema(s):\n  ` + erros.join("\n  "));
  process.exit(1);
}
console.log(`✓ ${paginas.length} página(s) auditada(s) em site/, nenhum problema.`);
