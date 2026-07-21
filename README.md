# CV Creator - PDF Generator

Gera PDF de curriculo a partir de JSON com **dois formatos suportados**:

- **Europass** (formato antigo)
- **Europass 2** (layout lateral com timeline)
- **Professional** (novo layout escuro, inspirado no PDF anexado)

## Instalacao

```bash
npm install
# Instala o browser na pasta local .browsers
PLAYWRIGHT_BROWSERS_PATH=./.browsers npx playwright install chromium
```

> O projeto procura o Chromium na pasta local `.browsers`. Por isso, use o
> comando acima com `PLAYWRIGHT_BROWSERS_PATH=./.browsers`; executar apenas
> `npx playwright install` instala os browsers no cache global e pode causar o
> erro `Executable doesn't exist` ao gerar o PDF.

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

- Se `cvKind` nao existir, o sistema assume **Europass**.
- `cvKind: "europass"` usa template **Europass**.
- `cvKind: "europass-2"` usa template **Europass 2**.
- `cvKind: "professional"` usa template **Professional**.

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
    professional/
      render.ts
      types.ts
  render/
    assets.ts
    html.ts
    html-utils.ts
    pdf.ts
```

## Exemplos de config

- Europass: `configs/cv-config.example.json`
- Europass 2: `configs/cv-config.europass-2.example.json`
- Professional: `configs/cv-config.professional.example.json`
