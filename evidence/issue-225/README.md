# Evidências — issue #225

Correção do overflow horizontal de `/grupos/$slug` no mobile e do deslocamento do modal de
remoção de publicação.

## Ambiente

- Chrome headless via Playwright, **emulação mobile** (`isMobile: true`, `hasTouch: true`).
- Viewports: **320×700**, **374×846** (mesmo do print da issue), **390×844** e **1280×800**.
- DPR 1, dados falsos roteados em `/api/**` (sem sessão, e-mail ou conteúdo real).
- Base de comparação: `qa` e o commit do PR #300 (`3a02fe1`, só o `flex-wrap` da linha de ações).

## Medições

| Cenário                                  | Antes                                                                | Depois                                                           |
| ---------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 374, textos normais (`qa`, sem correção) | `innerWidth 407`, `scrollWidth 407`, dialog `x=33` / `right=375`     | `innerWidth 374`, `scrollWidth 374`, dialog `x=16` / `right=358` |
| 374, textos longos moderados (só #300)   | `innerWidth 628`, `scrollWidth 628`, dialog `x=143` / `right=485`    | `innerWidth 374`, `scrollWidth 374`, dialog `x=16` / `right=358` |
| 374, textos extremos (só #300)           | `innerWidth 1110`, `scrollWidth 1110`, dialog `x=384` (fora da tela) | `innerWidth 374`, `scrollWidth 374`, dialog `x=16` / `right=358` |
| 374, comentários abertos (extremos)      | —                                                                    | `innerWidth 374`, `scrollWidth 374`                              |
| 390, textos longos                       | —                                                                    | `innerWidth 390`, `scrollWidth 390`, dialog `x=16` / `right=374` |
| 1280, desktop                            | —                                                                    | `innerWidth 1280`, `scrollWidth 1280`                            |

Fixtures de texto longo, nos limites do app: nome do grupo 120, descrição 600, tópico 80,
nome do autor 120, post 1200 e comentário 1200 — todos sem espaço, para forçar o pior caso.

### 320px

O conteúdo da página de grupo fecha em 320px, mas o **header global** ainda tem 8,5px de
transbordo nesse viewport (pré-existente, fora do escopo desta issue): o alerta de mensagens
(`fixed inset-x-0`) acompanha o layout viewport e o dialog fica em `x=21` em vez de `x=16`.
Registrado no PR como pendência separada.

## Por que acontecia

O dialog usa `position: fixed` + `left: 50%`. Em emulação mobile, quando a página tem overflow
horizontal, o **layout viewport** cresce junto com o conteúdo (`innerWidth` vira 407, 628 ou
1110), enquanto `100vw` continua 374. O `left: 50%` centraliza no viewport expandido e o modal
anda para a direita; quanto maior o conteúdo, maior o deslocamento.

## Prints

- `374-normal-antes.png` — `qa`, dialog deslocado para a direita.
- `374-normal-depois.png` — corrigido, dialog centralizado.
- `374-longos-antes.png` — só #300, textos longos; dialog fora do centro e conteúdo esticando a página.
- `374-longos-depois.png` — corrigido, dialog centralizado com textos longos.
- `374-textos-longos-depois.png` — nome/descrição quebrando em várias linhas.
- `374-claro-depois.png` — tema claro, conteúdo normal.
- `374-longos-comentarios-depois.png` — comentário longo aberto, sem overflow.
- `320-longos-depois.png` — 320px; grupo ok, header global com 8,5px de pendência.
- `1280-desktop-depois.png` — desktop sem regressão.

## Como reproduzir

1. `npm run dev` (porta 8080).
2. Rodar `verify-layout.mjs` no Playwright (é um snippet `async (page) => { ... }`).
3. Para o “antes”, checkout `3a02fe1` e trocar `MODE` para `"before"`.

As asserções principais, dentro de `page.evaluate`:

```js
document.documentElement.scrollWidth === document.documentElement.clientWidth;
window.innerWidth === document.documentElement.clientWidth; // emulação mobile
Math.abs(dialog.left - (document.documentElement.clientWidth - dialog.width) / 2) <= 1;
```
