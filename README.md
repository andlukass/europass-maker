# CV Creator - PDF Generator

Gera PDF de curriculo a partir de JSON com **dois formatos suportados**:

- **Europass** (formato antigo)
- **Professional** (novo layout escuro, inspirado no PDF anexado)

## Instalacao

```bash
npm install
# Instala o browser na pasta local .browsers
PLAYWRIGHT_BROWSERS_PATH=./.browsers npx playwright install chromium
```

## Uso rapido

### 1) Modo interativo (Europass)

```bash
npm run cv
```

Guarda o JSON em `configs/cv-config.json` e gera `cv-europass.pdf`.

### 2) Modo JSON (auto-detecta o formato)

Europass:

```bash
npm run cv -- --config configs/cv-config.example.json --out meu-cv.pdf
```

Professional:

```bash
npm run cv -- --config configs/cv-config.professional.example.json --out meu-cv.pdf
```

## Dev (watch)

```bash
npm run dev -- configs/cv-config.professional.example.json
```

Ou com Europass:

```bash
npm run dev -- configs/cv-config.example.json
```

## Opcoes da CLI

| Opcao | Descricao |
|-------|-----------|
| `--config <path>` | Caminho para JSON |
| `--out <path>` | Caminho do PDF gerado |
| `--rasc` | Adiciona watermark de rascunho (apenas template Europass) |

## Como o formato e detectado

- Se o JSON tiver `personal.name`, usa **Europass**.
- Se o JSON tiver `header.name` e `summary.text`, usa **Professional**.

## Organizacao das pastas

```text
src/
  cv-formats/
    common.ts
    detect.ts
    types.ts
    europass/
      dictionary.ts
      prompts.ts
      render.ts
      types.ts
      validate.ts
    professional/
      render.ts
      types.ts
      validate.ts
  render/
    assets.ts
    html.ts
    html-utils.ts
    pdf.ts
```

## Exemplos de config

- Europass: `configs/cv-config.example.json`
- Professional: `configs/cv-config.professional.example.json`
