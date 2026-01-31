# CV Creator – Europass PDF Generator

Gera um PDF de currículo no formato **Europass** a partir de dados introduzidos interativamente ou de um ficheiro JSON.

## Instalação

```bash
npm install
# Instala o browser na pasta local .browsers
PLAYWRIGHT_BROWSERS_PATH=./.browsers npx playwright install chromium
```

## Modo interativo

Executa o fluxo de perguntas e guarda a configuração em JSON (o PDF será gerado em `./cv-europass.pdf` por padrão):

```bash
npm run cv
```

Ou após build:

```bash
npm run build && npm start
```

Perguntas:

1. **Dados pessoais**: caminho para foto (opcional), nome (obrigatório), nacionalidade, sexo, email, telemóvel, morada (opcionais; em branco = omitir)
2. **Secções**: para cada secção, indica se quer incluir e, em caso afirmativo, introduz o conteúdo:
   - Apresentação (texto multi-linha; termina com linha vazia)
   - Objetivo profissional (texto)
   - Experiência profissional (lista: datas, país, cargo, empresa, responsabilidades)
   - Educação e formação (lista: título, instituição)
   - Competências linguísticas (língua nativa)
   - Habilidades (lista de bullets)

No final, a configuração é guardada em `configs/cv-config.json` e o PDF em `cv-europass.pdf`.

## Modo JSON

Gera o PDF diretamente a partir de um ficheiro de configuração:

```bash
npm run cv -- --config configs/cv-config.example.json --out meu-cv.pdf
```

## Dev (watch)

Observa um ficheiro JSON e regenera automaticamente o PDF quando houver alterações:

```bash
npm run dev -- configs/cv-config.example.json
```

Por padrão, também observa mudanças no código (`src/**` e `tailwind.config.js`) e volta a gerar o PDF.

Ou:

```bash
node dist/index.js --config configs/cv-config.example.json --out meu-cv.pdf
```

## Opções da CLI

| Opção | Descrição |
|-------|-----------|
| `--config <path>` | Caminho para JSON (ativa modo JSON, sem perguntas) |
| `--out <path>` | Caminho do PDF gerado (default: `./cv-europass.pdf`) |
| `--save-config <path>` | Onde guardar o JSON no modo interativo (default: `./configs/cv-config.json`) |
| `--logo <path>` | Caminho para imagem do logo Europass (se não indicado, usa mock) |

## Estrutura do JSON

```json
{
  "outputPdf": "cv.pdf",
  "personal": {
    "photoPath": "",
    "name": "Nome Completo",
    "nationality": "Português",
    "sex": "Masculino",
    "email": "email@exemplo.pt",
    "phone": "+351 912 345 678",
    "address": "Cidade - País"
  },
  "sections": {
    "presentation": { "text": "Texto de apresentação..." },
    "objective": { "text": "Objetivo profissional." },
    "experience": {
      "items": [
        {
          "from": "2019",
          "to": "2024",
          "country": "Portugal",
          "role": "Título do Cargo",
          "company": "Nome da Empresa",
          "bullets": ["Responsabilidade 1.", "Responsabilidade 2."]
        }
      ]
    },
    "education": {
      "items": [
        {
          "title": "Ensino Secundário Completo (12º)",
          "institution": "Nome da Escola"
        }
      ]
    },
    "languages": { "nativeLanguage": "Português" },
    "skills": {
      "items": ["Habilidade 1", "Habilidade 2"]
    }
  }
}
```

- Campos em branco ou ausentes em `personal` são omitidos do PDF (exceto `name`, obrigatório).
- `photoPath` vazio ou ausente = sem foto.
- Cada secção em `sections` é opcional; só aparece no PDF se existir e tiver conteúdo.

## Logo Europass

O script inclui um mock do logo. Para usar a imagem real, indique o caminho com `--logo` ou inclua `logoPath` no JSON:

```json
{
  "logoPath": "caminho/para/logo-europass.png",
  "personal": { ... },
  "sections": { ... }
}
```
