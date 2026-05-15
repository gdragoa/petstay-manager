# 🐾 PetStay Manager — Guia de Desenvolvimento para Claude Code

> **Sistema open source de gestão de hospedagem pet** com contratos digitais, armazenamento local (JSON) e personalização por estabelecimento.
> Stack: Node.js (Express) + React (Vite + Tailwind CSS) + db.json
> Idioma da interface: Bilíngue PT/EN | Tema: Colorido com suporte a Dark/Light mode

---

## ⚠️ Princípios Fundamentais do Projeto

Antes de escrever qualquer linha de código, internalize estas regras:

1. **Dados nunca se perdem.** A pasta `/backend/data` é sagrada. Nenhuma atualização de código deve apagar, sobrescrever ou corromper dados existentes.
2. **Migrações são obrigatórias.** Qualquer mudança de schema exige um script de migração versionado.
3. **Zero dependências externas pagas.** Sem APIs de terceiros, sem serviços de assinatura na nuvem, sem bancos de dados externos.
4. **Open source por design.** Qualquer hotelzinho deve conseguir clonar, rodar e atualizar sem precisar de um desenvolvedor dedicado.
5. **Mobile-first na página de assinatura.** O cliente assina pelo celular. Qualquer falha de UX nessa tela quebra o fluxo inteiro.

---

## 🌍 Arquitetura Open Source

### Filosofia de Distribuição

O PetStay Manager é projetado para ser **clonado, não instalado**. Cada estabelecimento mantém sua própria cópia do repositório e puxa atualizações quando quiser, sem risco de perder dados.

```
[Repositório Oficial no GitHub]
         │
         │  git clone (primeira vez)
         ▼
[Instância Local do Hotelzinho A]      [Instância Local do Hotelzinho B]
  /pet-stay-manager                      /pet-stay-manager
  ├── /backend/src    ← código            ├── /backend/src    ← código
  ├── /frontend/src   ← código            ├── /frontend/src   ← código
  └── /backend/data   ← dados LOCAIS      └── /backend/data   ← dados LOCAIS
       (nunca vai pro GitHub)                  (nunca vai pro GitHub)
```

### Fluxo de Atualização (git pull + migração automática)

Quando o repositório oficial receber melhorias, o hotelzinho atualiza assim:

```bash
# 1. Puxar o código novo (nunca afeta /data)
git pull origin main

# 2. Instalar novas dependências (se houver)
npm run install:all

# 3. Iniciar — migrações rodam automaticamente ao detectar versão diferente
npm run dev
```

O sistema detecta automaticamente se o `db.json` está desatualizado e executa as migrações necessárias antes de iniciar o servidor. Os dados existentes são preservados integralmente.

### Estrutura de Diretórios Completa

```
/pet-stay-manager
├── /backend
│   ├── /src
│   │   ├── /routes           # Endpoints da API REST
│   │   ├── /middleware        # Validação, erros, CORS
│   │   ├── /utils             # PDF, backup, UUID, hash
│   │   └── /migrations        # Scripts versionados de migração
│   │       ├── index.js       # Runner de migrações
│   │       ├── v1.0.0.js      # Schema inicial
│   │       └── v1.1.0.js      # Exemplo futuro
│   └── /data                  # ⚠️ NUNCA commitar — listado no .gitignore
│       ├── db.json
│       ├── /uploads           # Comprovantes de vacinação
│       ├── /pdfs              # Contratos gerados
│       └── /backups           # Cópias automáticas do db.json
├── /frontend
│   └── /src
│       ├── /components
│       │   ├── /ui            # Design system base
│       │   ├── /admin         # Painel administrativo
│       │   └── /signing       # Página pública de assinatura
│       ├── /pages
│       ├── /hooks
│       ├── /lib
│       └── /i18n              # Traduções PT/EN
├── /docs                      # Documentação open source
│   ├── INSTALLATION.md
│   ├── UPDATING.md
│   ├── CONTRIBUTING.md
│   └── MIGRATIONS.md
├── .gitignore                 # backend/data/ DEVE estar aqui
├── .env.example
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE                    # MIT
├── README.md
└── package.json               # Scripts de orquestração global
```

### Arquivos de Documentação Obrigatórios

**`README.md`** deve conter:
- Pré-requisitos (Node.js 18+, npm)
- Instalação em 3 comandos (`git clone`, `npm run install:all`, `npm run dev`)
- Screenshot do painel e da página de assinatura
- Links para `docs/UPDATING.md` e GitHub Issues

**`CHANGELOG.md`** deve seguir o formato [Keep a Changelog](https://keepachangelog.com):
```markdown
## [1.1.0] - 2025-02-01
### Added
- Campo de observações na reserva
### Fixed
- Bug no cálculo de diárias com check-out no mesmo dia
### Migration
- v1.1.0.js: adiciona campo `observacoes` em bookings existentes
```

**`CONTRIBUTING.md`** deve explicar:
- Como criar uma nova migração ao alterar o schema
- Como adicionar traduções PT/EN
- Convenção de commits (Conventional Commits)
- Como abrir um PR

**`docs/UPDATING.md`**: fluxo de `git pull` + migração automática com exemplos de terminal

**`docs/MIGRATIONS.md`**: como criar, registrar e testar uma migração

---

## 🗂️ Schema Completo do db.json

> ⚠️ **Regra de ouro sobre o db.json:** Nunca salvar arquivos binários (imagens, PDFs, assinaturas) dentro do JSON. Todo arquivo é salvo em disco em `/data/uploads/` e apenas o **path relativo** é gravado no JSON. Isso evita crescimento descontrolado do arquivo, lentidão nas leituras síncronas e risco de corrupção.

```json
{
  "version": "1.0.0",
  "settings": {
    "nome_estabelecimento": "PetStay",
    "logo_path": null,
    "cor_primaria": "#F97316",
    "tema_padrao": "light",
    "telefone_contato": "",
    "cidade": "",
    "moeda": "BRL",
    "diaria_base": 80.00,
    "idioma_padrao": "pt",
    "contrato_validade_horas": null,
    "base_url": "http://localhost:3001",
    "onboarding_completo": false
  },
  "tutors": [],
  "animals": [],
  "bookings": [],
  "contracts": [],
  "services": [],
  "blocked_dates": []
}
```

> **`logo_path`** substitui `logo_base64`: o logo é salvo como arquivo em `/data/uploads/logo/logo.png` e apenas o path é gravado no JSON. O frontend carrega via `GET /api/settings/logo` que serve o arquivo estático.
>
> **`base_url`** é configurado pelo usuário nas Settings para refletir a URL pública real do sistema (ex: `https://meuhotel.ngrok.io`, `https://meudominio.com` ou `http://localhost:3001` para uso interno). É usada para gerar os links de assinatura e QR Codes.

### Modelos de Dados Detalhados

```typescript
// Tutor
{
  id: string,           // UUID v4
  nome: string,
  telefone: string,
  email: string,
  endereco: string,
  tipo: "primario" | "secundario",
  created_at: string    // ISO 8601
}

// Animal
{
  id: string,
  tutor_id: string,
  nome: string,
  especie: "cachorro" | "gato" | "outro",
  raca: string,
  idade: number,
  peso: number,
  saude: {
    vacinas: string[],
    alergias: string[],
    observacoes: string
  },
  preferencias: {
    alimentacao: string,
    comportamento: string
  },
  arquivos_vacinacao: string[],  // paths relativos em /uploads
  created_at: string
}

// Booking
{
  id: string,
  animal_id: string,
  tutor_id: string,
  data_entrada: string,    // YYYY-MM-DD
  data_saida: string,
  valor_diaria: number,
  valor_total: number,
  status_pagamento: "pendente" | "pago" | "parcial",
  status_presenca: "agendado" | "check-in" | "check-out" | "cancelado",
  servicos_adicionais: [
    { servico_id: string, nome: string, nome_en: string, valor: number }
  ],
  observacoes: string,
  created_at: string
}

// Contract
{
  id: string,
  booking_id: string,
  token_unico: string,           // UUID v4 gerado ao criar a reserva
  status: "gerado" | "visualizado" | "assinado" | "expirado",
  data_geracao: string,
  data_expiracao: string | null, // null = sem expiração até ser assinado
  data_visualizacao: string | null,
  data_assinatura: string | null,
  assinatura_path: string | null,    // ⚠️ Path do arquivo PNG em /uploads/signatures/
                                     // NÃO salvar base64 no JSON — arquivo pode ter 50-200KB
                                     // Ex: "signatures/contrato_abc123_sig.png"
  nome_digitado: string | null,      // Nome digitado pelo signatário
  aceite_termos: boolean,
  ip_assinante: string | null,
  user_agent: string | null,
  hash_verificacao: string | null,   // SHA-256 de autenticidade
  pdf_rascunho_path: string | null,
  pdf_final_path: string | null
}

// Service
{
  id: string,
  nome: string,
  nome_en: string,
  valor: number,
  ativo: boolean
}

// Blocked Date
{
  id: string,
  data: string,   // YYYY-MM-DD
  motivo: string
}
```

---

## 🚀 ETAPA 1 — Configuração Inicial do Projeto

**Objetivo:** Criar a estrutura de pastas, instalar dependências e configurar scripts de orquestração.

### Tarefas

1. **`package.json` raiz** com `concurrently`:
```json
{
  "name": "pet-stay-manager",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "install:all": "npm install && npm install --prefix backend && npm install --prefix frontend",
    "build": "npm run build --prefix frontend",
    "update": "git pull origin main && npm run install:all"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

2. **`.gitignore` raiz** — obrigatoriamente incluir:
```
node_modules/
backend/data/
backend/node_modules/
frontend/node_modules/
frontend/dist/
.env
*.log
```

3. **`.env.example`**:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

4. **Backend** (`/backend`): Express, cors, uuid, multer, pdfkit, qrcode, nodemon
   - Script `dev`: `nodemon src/index.js` | Script `start`: `node src/index.js`
   - Porta: `3001`

5. **Frontend** (`/frontend`): Vite + React + TypeScript, Tailwind CSS v3, React Router DOM v6, Axios
   - Proxy no `vite.config.ts`: `/api` → `http://localhost:3001`
   - Porta: `5173`

6. Criar `/docs/UPDATING.md`, `/docs/MIGRATIONS.md`, `CHANGELOG.md` e `CONTRIBUTING.md`

### Critérios de Aceite
- [ ] `npm run dev` inicia backend e frontend simultaneamente
- [ ] `GET /health` retorna `{ status: "ok", version: "1.0.0" }`
- [ ] `backend/data/` está no `.gitignore`
- [ ] Todos os arquivos de documentação existem (podem estar parcialmente preenchidos)

---

## 🗄️ ETAPA 2 — Backend: Inicialização, Banco de Dados e Migrações

**Objetivo:** Núcleo do sistema — inicialização segura, gerenciador do `db.json` e runner de migrações versionado.

### `/backend/src/index.js` — Sequência de Inicialização

```
1. Verificar/criar /data e subpastas (/uploads, /pdfs, /backups)
2. Verificar/criar db.json com schema padrão
3. runMigrations() — atualiza schema sem apagar dados
4. autoBackup() — faz backup se o último tem > 24h
5. Iniciar Express na porta 3001
6. Log: "PetStay Manager v1.0.0 rodando na porta 3001 ✓"
```

### `/backend/src/utils/db.js`

> ⚠️ **Problema de concorrência:** `fs.writeFileSync` não é thread-safe. Se dois requests chegarem simultaneamente (ex: admin fazendo check-in enquanto cliente assina), o segundo write pode sobrescrever silenciosamente o primeiro. A solução é uma fila de writes serializada.

```javascript
// Operações de leitura: síncronas com fs.readFileSync (rápidas, sem risco)
// Operações de escrita: serializadas via fila de Promises para evitar race conditions

let writeQueue = Promise.resolve(); // Fila global de writes

function writeDb(data) {
  // Enfileira o write — cada write aguarda o anterior terminar
  writeQueue = writeQueue.then(() => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  });
  return writeQueue;
}

// As demais funções (insertOne, updateOne, deleteOne) devem
// sempre fazer readDb() → modificar → writeDb() dentro da mesma operação
// para garantir que leram o estado mais recente antes de escrever.

readDb()                            // Lê e parseia db.json (síncrono)
writeDb(data)                       // Escreve serializado via fila (assíncrono)
getCollection(name)                 // Retorna array da coleção
insertOne(collection, item)         // Adiciona id UUID v4 + created_at automático
updateOne(collection, id, data)     // Merge parcial (preserva campos não enviados)
deleteOne(collection, id)           // Remove por id
findById(collection, id)            // Retorna item ou null
findWhere(collection, filters)      // Filtro por igualdade de campos
getSetting(key)                     // Atalho para settings
updateSettings(data)                // Merge parcial nas settings
```

### `/backend/src/migrations/index.js` — Runner de Migrações

```javascript
const APP_VERSION = "1.0.0"; // Atualizar a cada release

async function runMigrations() {
  const db = readDb();
  const dbVersion = db.version || "0.0.0";

  if (dbVersion === APP_VERSION) return; // Nada a fazer

  // ⚠️ BACKUP OBRIGATÓRIO antes de qualquer migração
  // Se a migração tiver um bug, o usuário pode restaurar manualmente
  console.log(`Fazendo backup preventivo antes de migrar...`);
  await backupDb(`pre_migration_${dbVersion}_to_${APP_VERSION}`);
  console.log(`✓ Backup salvo. Migrando banco: ${dbVersion} → ${APP_VERSION}`);

  const migrations = [
    { version: "1.0.0", run: require("./v1.0.0") },
    // Novas migrações adicionadas aqui em ordem crescente
  ];

  for (const migration of migrations) {
    if (isVersionGreater(migration.version, dbVersion)) {
      await migration.run(readDb, writeDb);
      writeDb({ ...readDb(), version: migration.version });
      console.log(`✓ Migração ${migration.version} concluída`);
    }
  }
}
```

### `/backend/src/migrations/v1.0.0.js` — Migração Inicial (idempotente)

```javascript
module.exports = async function migrate_v1_0_0(readDb, writeDb) {
  const db = readDb();
  
  // Garantir todas as coleções existem (nunca sobrescrever se já existem)
  if (!db.tutors) db.tutors = [];
  if (!db.animals) db.animals = [];
  if (!db.bookings) db.bookings = [];
  if (!db.contracts) db.contracts = [];
  if (!db.services) db.services = [];
  if (!db.blocked_dates) db.blocked_dates = [];
  
  // Garantir settings padrão (spread preserva valores já configurados)
  db.settings = {
    nome_estabelecimento: "PetStay",
    logo_path: null,              // path relativo em /uploads/logo/ — nunca base64 no JSON
    cor_primaria: "#F97316",
    tema_padrao: "light",
    telefone_contato: "",
    cidade: "",
    moeda: "BRL",
    diaria_base: 80.00,
    idioma_padrao: "pt",
    contrato_validade_horas: null,
    base_url: "http://localhost:3001",
    onboarding_completo: false, // false = exibir tela de configuração inicial ao abrir
    ...db.settings
  };

  writeDb(db);
};
```

### Regra para Contribuidores (documentar no CONTRIBUTING.md)

Ao alterar o schema do `db.json` em qualquer PR, o contribuidor DEVE obrigatoriamente:
1. Criar `/backend/src/migrations/vX.Y.Z.js`
2. Registrar no array do `index.js`
3. Atualizar `APP_VERSION`
4. Documentar no `CHANGELOG.md`
5. A migração SEMPRE deve usar spread `...existingData` para preservar campos existentes

### `/backend/src/utils/backup.js`

```javascript
backupDb()              // Copia db.json → /backups/db_YYYY-MM-DD_HHmmss.json
listBackups()           // Lista backups ordenados por data (mais recente primeiro)
restoreBackup(fname)    // Sobrescreve db.json (faz backup do atual antes de restaurar)
autoBackup()            // Chama backupDb() se o último backup tem mais de 24h
```

### Critérios de Aceite
- [ ] Backend inicia sem erros com `/data` completamente vazia
- [ ] `db.json` criado com schema completo na primeira execução
- [ ] Segunda execução não altera dados existentes (idempotência)
- [ ] **Backup automático gerado ANTES de executar qualquer migração**
- [ ] Migrações atualizam o campo `version` no arquivo
- [ ] `backupDb()` gera arquivo datado em `/backups`

---

## 🔌 ETAPA 3 — Backend: Rotas da API REST

**Objetivo:** Todos os endpoints REST com validação e resposta padronizada.

### Formato de Resposta

```json
{ "success": true,  "data": { ... } }
{ "success": true,  "data": [...], "total": 42 }
{ "success": false, "error": "Mensagem amigável", "code": "VALIDATION_ERROR" }
```

### Rotas por Módulo

**Settings**
```
GET  /api/settings
PUT  /api/settings
POST /api/settings/logo         → multipart → salva PNG em /uploads/logo/logo.png
                                  grava logo_path no db (nunca base64 no JSON)
GET  /api/settings/logo         → serve o arquivo de logo estático
POST /api/backup
GET  /api/backup/list
POST /api/backup/restore/:fname
GET  /api/health                → público, sem auth
```

**Tutors**
```
GET    /api/tutors              → ?q=busca por nome
GET    /api/tutors/:id          → inclui animais do tutor
POST   /api/tutors              → nome + telefone obrigatórios
PUT    /api/tutors/:id
DELETE /api/tutors/:id          → bloquear se tiver bookings ativos
```

**Animals**
```
GET    /api/animals             → ?tutor_id=
GET    /api/animals/:id         → inclui histórico de bookings
POST   /api/animals             → tutor_id + nome + especie obrigatórios
PUT    /api/animals/:id
DELETE /api/animals/:id
POST   /api/animals/:id/vacina          → upload → /uploads/animal_{id}/
DELETE /api/animals/:id/vacina/:fname
```

**Bookings**
```
GET    /api/bookings            → ?status= ?data= ?q=
GET    /api/bookings/:id        → booking + animal + tutor + contrato
POST   /api/bookings            → cria booking + gera contrato automaticamente
PUT    /api/bookings/:id
PUT    /api/bookings/:id/checkin
PUT    /api/bookings/:id/checkout
PUT    /api/bookings/:id/pagamento
DELETE /api/bookings/:id        → cancela
GET    /api/bookings/calendar   → ?mes=YYYY-MM → datas ocupadas
```

**Contracts** — detalhado na Etapa 4

**Services**
```
GET    /api/services
POST   /api/services
PUT    /api/services/:id
DELETE /api/services/:id        → soft delete (ativo: false)
```

**Dates**
```
GET    /api/dates/blocked
POST   /api/dates/blocked
DELETE /api/dates/blocked/:id
```

### Middleware
- **`errorHandler.js`**: captura todos os erros, retorna JSON padronizado, nunca expõe stack trace
- **`validate.js`**: factory de validators por rota
- **CORS**: `localhost:5173` em dev; variável `FRONTEND_URL` em produção

### Critérios de Aceite
- [ ] Todas as rotas retornam formato padronizado
- [ ] DELETE com dependências ativas retorna erro claro com `code`
- [ ] Upload valida tipo MIME no backend (não só extensão)
- [ ] `/api/health` responde sem autenticação

---

## ✍️ ETAPA 4 — Backend: Fluxo Completo de Contratos e Assinatura Digital

**Objetivo:** Geração de link seguro, coleta de assinatura com tripla validação e registro com prova de autenticidade.

### Fluxo Completo

```
[Admin cria reserva]
        │
        ▼
Backend gera contrato com token UUID único
        │
        ▼
Admin copia link → https://dominio.com/assinar?t=TOKEN_UUID
        │
        ▼
Admin envia link via WhatsApp (template pronto no painel)
        │
        ▼
[Cliente abre o link no celular]
        │
        ▼
Backend valida token → inválido/expirado: retorna erro
        │
        ▼
Backend marca contrato como "visualizado" + grava timestamp
        │
        ▼
[Cliente lê o contrato e preenche os 3 campos obrigatórios:]
  1. ✅ Checkbox "Li e aceito os termos"
  2. ✍️ Assinatura no Canvas (desenho manual)
  3. 📝 Nome completo digitado (confirmação de identidade)
        │
        ▼
POST /api/contracts/sign/:token
  { assinatura_base64, nome_digitado, aceite_termos: true }
        │
        ▼
Backend captura IP + User-Agent do request
        │
        ▼
Backend gera hash SHA-256:
  hash = SHA256(token + "|" + nome_digitado + "|" + timestamp + "|" + ip)
        │
        ▼
Backend grava no db.json:
  status: "assinado", data_assinatura, assinatura_base64,
  nome_digitado, ip_assinante, user_agent, hash_verificacao
        │
        ▼
Token invalidado permanentemente (uso único)
        │
        ▼
generateContractPdf(contractId, 'final') chamado
        │
        ▼
PDF final salvo em /pdfs/contrato_{id}_final.pdf
        │
        ▼
Cliente vê tela de sucesso + botão "Baixar PDF"
Admin vê no painel: contrato assinado + pode baixar PDF
```

### Rotas de Contrato

```
GET  /api/contracts/:id                → por ID (painel admin)
GET  /api/contracts/token/:token       → por token (ROTA PÚBLICA)
POST /api/contracts/:id/resend         → regera token, invalida o anterior
POST /api/contracts/sign/:token        → recebe assinatura (ROTA PÚBLICA)
GET  /api/contracts/:id/pdf/rascunho   → PDF sem assinatura (admin)
GET  /api/contracts/:id/pdf/final      → PDF assinado (admin + cliente)
GET  /api/contracts/verify/:hash       → verifica autenticidade (ROTA PÚBLICA)
```

### Regras de Negócio do Token

- **Uso único**: após assinatura, token não pode ser reutilizado
- **Validade**: configurável em `settings.contrato_validade_horas` (null = sem expiração até assinar)
- **Verificação de expiração obrigatória**: a rota `GET /api/contracts/token/:token` DEVE verificar ativamente:
  ```javascript
  // Verificar expiração antes de retornar o contrato
  if (contract.data_expiracao && new Date() > new Date(contract.data_expiracao)) {
    updateOne('contracts', contract.id, { status: 'expirado' });
    return res.json({ success: false, error: 'Contrato expirado', code: 'TOKEN_EXPIRED' });
  }
  if (contract.status === 'assinado') {
    return res.json({ success: false, error: 'Contrato já assinado', code: 'ALREADY_SIGNED' });
  }
  if (contract.status === 'expirado') {
    return res.json({ success: false, error: 'Contrato expirado', code: 'TOKEN_EXPIRED' });
  }
  ```
- **Reenvio**: admin pode regerar o token via `/resend`; o anterior é invalidado imediatamente
- **Status progressivo**: `gerado` → `visualizado` → `assinado` (nunca regride)

### `/backend/src/utils/contractHash.js`

```javascript
const crypto = require('crypto');

function generateHash(token, nomeDigitado, timestamp, ip) {
  const payload = `${token}|${nomeDigitado}|${timestamp}|${ip}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function verifyHash(hash, token, nomeDigitado, timestamp, ip) {
  return generateHash(token, nomeDigitado, timestamp, ip) === hash;
}

module.exports = { generateHash, verifyHash };
```

O hash aparece no rodapé do PDF e é codificado em um QR Code gerado localmente. Ao escanear, o QR Code abre a rota `/verificar?h=HASH` do próprio sistema, que exibe a confirmação de autenticidade sem expor dados sensíveis.

### Critérios de Aceite
- [ ] Token assinado não pode ser reutilizado (retorna erro `ALREADY_SIGNED`)
- [ ] Os 3 campos são obrigatórios — assinatura com qualquer ausência é rejeitada
- [ ] IP e User-Agent gravados no momento exato da assinatura
- [ ] Hash SHA-256 gerado e gravado no contrato
- [ ] `/verify/:hash` retorna `{ valid: true, signed_at, estabelecimento, pet, assinado_por }` sem dados sensíveis (sem base64, sem IP completo)
- [ ] Admin pode regerar token via `/resend`

---

## 📄 ETAPA 5 — Backend: Geração de PDF do Contrato

**Objetivo:** Dois PDFs com layout declarativo por coordenadas fixas — rascunho ao criar reserva e final após assinatura.

**Dependências:** `pdfkit`, `qrcode`

### Dois Tipos de PDF

| Tipo | Quando gerado | Diferencial |
|------|--------------|-------------|
| **Rascunho** | Ao criar a reserva | Marca d'água diagonal "PENDENTE DE ASSINATURA" em cinza claro |
| **Final** | Após assinatura do cliente | Imagem da assinatura canvas + nome digitado + IP + timestamp + hash SHA-256 + QR Code de verificação |

### Layout Declarativo — Coordenadas Fixas (A4 = 595 x 842 pt)

```
Y:  40  ┌──────────────────────────────────────────────────┐
        │ [LOGO 70x70 em x:40]  NOME DO ESTABELECIMENTO    │
        │                       Contrato de Hospedagem Pet  │
        │                       Cidade | Telefone           │
Y: 120  ├──────────────────────────────────────────────────┤
        │ ▌ DADOS DO RESPONSÁVEL                           │
        │   Nome: ________________  Telefone: ____________ │
        │   Email: _______________  Endereço: ____________ │
Y: 200  ├──────────────────────────────────────────────────┤
        │ ▌ DADOS DO ANIMAL                                │
        │   Nome: _______  Espécie: ______  Raça: ________ │
        │   Peso: ___kg    Idade: ___       Alergias: _____ │
Y: 280  ├──────────────────────────────────────────────────┤
        │ ▌ DADOS DA HOSPEDAGEM                            │
        │   Check-in: __________  Check-out: _____________ │
        │   Diárias: ___   Valor/diária: R$ ______________ │
        │   ┌──────────────────────────────────────┐       │
        │   │ Serviços adicionais:                 │       │
        │   │ • Banho e tosa ................R$ __ │       │
        │   │ • Passeio .....................R$ __ │       │
        │   └──────────────────────────────────────┘       │
        │   VALOR TOTAL: R$ ____________                   │
Y: 420  ├──────────────────────────────────────────────────┤
        │ ▌ CLÁUSULAS DO CONTRATO                          │
        │ 1. Responsabilidade: O estabelecimento...        │
        │ 2. Saúde e Vacinação: O responsável declara...   │
        │ 3. Pagamento: O valor acordado...                 │
        │ 4. Cancelamento: Com menos de 48h...             │
        │ 5. Emergências: O estabelecimento está           │
        │    autorizado a decisões veterinárias...         │
        │ 6. Limitação: Doenças preexistentes...           │
Y: 640  ├──────────────────────────────────────────────────┤
        │ ▌ ASSINATURA DIGITAL  (somente no PDF final)     │
        │                                                  │
        │   [Imagem canvas base64 — 200x80px em x:40]      │
        │   ________________________                        │
        │   Nome: __________________ (digitado pelo tutor) │
        │   Assinado em: DD/MM/YYYY HH:MM:SS               │
        │   IP: ______________                              │
Y: 750  ├──────────────────────────────────────────────────┤
        │ Hash SHA-256: [código em Courier tamanho 7]      │
        │                        [QR Code 60x60 em x:495]  │
        │                        Verificar autenticidade   │
Y: 842  └──────────────────────────────────────────────────┘
```

### Função Principal

```javascript
// /backend/src/utils/pdfGenerator.js

async function generateContractPdf(contractId, tipo = 'final') {
  // 1. Buscar contrato, booking, animal, tutor e settings do db
  // 2. Criar PDFDocument: { size: 'A4', margin: 40, autoFirstPage: true }
  // 3. Usar APENAS fontes embutidas no pdfkit: Helvetica, Helvetica-Bold, Courier
  //    (sem fontes externas — garantia de funcionar em qualquer sistema)
  // 4. Renderizar cada seção com doc.text(texto, x, y) — coordenadas ABSOLUTAS
  // 5. Se tipo === 'rascunho':
  //    - doc.save() → doc.rotate(45, { origin: [297, 421] })
  //    - doc.fontSize(60).fillColor('#DDDDDD').text('PENDENTE DE ASSINATURA', ...)
  //    - doc.restore()
  // 6. Se tipo === 'final':
  //    a. Ler assinatura do arquivo em disco (não do db.json):
  //       const sigPath = path.join(DATA_DIR, contract.assinatura_path);
  //       doc.image(sigPath, 40, 660, { width: 200, height: 80 })
  //       ⚠️ Nunca receber ou reler base64 do db — ler o arquivo diretamente
  //
  //    b. Gerar QR Code localmente (sem APIs externas):
  //       O QR Code é gerado em memória como PNG Buffer usando a lib `qrcode`.
  //       Ele codifica a URL de verificação do próprio sistema:
  //       
  //       const qrBuffer = await QRCode.toBuffer(
  //         `${process.env.BASE_URL}/verificar?h=${contract.hash_verificacao}`,
  //         { type: 'png', width: 150, margin: 1 }
  //       );
  //       
  //       Ao escanear o QR Code no PDF, o usuário é levado para a rota pública
  //       GET /api/contracts/verify/:hash, que retorna:
  //       { valid: true, estabelecimento, pet, assinado_por, signed_at }
  //       — sem expor dados sensíveis como base64 da assinatura ou IP completo.
  //
  //    c. Inserir QR Code no PDF: doc.image(qrBuffer, 495, 755, { width: 60, height: 60 })
  //    d. Legenda: doc.fontSize(7).text('Verificar autenticidade', 487, 817)
  //    e. Hash textual: doc.font('Courier').fontSize(7).text(`SHA-256: ${hash}`, 40, 762)
  // 7. Salvar em /data/pdfs/contrato_{contractId}_{tipo}.pdf
  // 8. Atualizar pdf_rascunho_path ou pdf_final_path no contrato no db
  // 9. Retornar path relativo
}
```

### Regras de Layout para Manutenção Futura

- **NUNCA** usar `doc.moveDown()` ou layout fluido — apenas `doc.text(str, x, y)` com posição absoluta
- Texto longo: truncar com `...` para não ultrapassar a margem direita (x + largura máxima 515pt)
- Logo: se `settings.logo_base64` existir, converter Buffer e inserir; caso contrário, espaço vazio
- Novas seções adicionadas em futuras versões: adicionar ABAIXO de Y:640, nunca deslocar seções existentes

### Cláusulas Fixas (hardcoded, bilíngue)

As cláusulas são hardcoded no gerador, não no banco. Ao atualizar o repositório, todos os hotelzinhos recebem a versão mais recente das cláusulas automaticamente.

```javascript
const CLAUSULAS = {
  pt: [
    "1. Responsabilidade: O estabelecimento se compromete a zelar pelo bem-estar, alimentação e segurança do animal durante o período contratado.",
    "2. Saúde e Vacinação: O responsável declara que o animal está com as vacinas em dia e apto para conviver com outros animais.",
    "3. Pagamento: O valor acordado deve ser quitado conforme combinado. A não quitação poderá resultar em retenção do animal.",
    "4. Cancelamento: Cancelamentos com menos de 48h de antecedência estão sujeitos à cobrança de 50% do valor total.",
    "5. Emergências: O estabelecimento está autorizado a tomar decisões veterinárias emergenciais, sendo os custos de responsabilidade do tutor.",
    "6. Limitação: O estabelecimento não se responsabiliza por doenças preexistentes ou condições não informadas no check-in."
  ],
  en: [ /* tradução de todas as cláusulas */ ]
};
```

### Critérios de Aceite
- [ ] PDF rascunho gerado ao criar reserva, com marca d'água diagonal
- [ ] PDF final gerado após assinatura com: imagem do canvas, nome digitado, IP, timestamp, hash SHA-256 e QR Code
- [ ] QR Code gerado localmente (sem APIs externas) aponta para `/verificar?h=HASH` do próprio sistema
- [ ] Página `/verificar` exibe confirmação de autenticidade sem expor dados sensíveis
- [ ] Layout não quebra com nomes longos ou muitos serviços adicionais
- [ ] Funciona sem fontes externas instaladas no sistema operacional
- [ ] Arquivos salvos como `contrato_{id}_rascunho.pdf` e `contrato_{id}_final.pdf`

---

## 🎨 ETAPA 6 — Frontend: Design System e Componentes Base

**Objetivo:** Design system completo com Dark/Light mode, paleta colorida com identidade pet.

### Configuração do Tema

```css
/* /frontend/src/index.css */
:root {
  --color-primary: #F97316;
  --color-primary-dark: #C2410C;
  --color-secondary: #10B981;
  --color-accent: #6366F1;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;

  /* Light mode */
  --bg-base: #FFFBF7;
  --bg-card: #FFFFFF;
  --bg-sidebar: #FFF7ED;
  --bg-hover: #FEF3E2;
  --text-primary: #1C1917;
  --text-secondary: #78716C;
  --text-muted: #A8A29E;
  --border: #FED7AA;
}

[data-theme="dark"] {
  --bg-base: #1C1917;
  --bg-card: #292524;
  --bg-sidebar: #231F1D;
  --bg-hover: #3C3836;
  --text-primary: #FAFAF9;
  --text-secondary: #D6D3D1;
  --text-muted: #78716C;
  --border: #44403C;
}
```

**Tipografia:** `Plus Jakarta Sans` (títulos) + `DM Sans` (corpo) via Google Fonts

### Componentes Base (`/frontend/src/components/ui/`)

```
Button.tsx          variants: primary | secondary | ghost | danger | outline
                    sizes: sm | md | lg | states: loading, disabled
Input.tsx           label flutuante, estado de erro, ícone prefixo/sufixo
Textarea.tsx        contador de caracteres opcional
Select.tsx          dropdown customizado
Card.tsx            variants: default | elevated | bordered | highlight
Badge.tsx           variants: success | warning | error | info | neutral | pending
Modal.tsx           overlay, animação slide-up, foco trap
Drawer.tsx          painel lateral (mobile-friendly)
Table.tsx           empty state, loading skeleton, ordenação
Tabs.tsx            indicador animado
Avatar.tsx          foto ou fallback emoji por espécie (🐶 🐱 🐰 🐦)
Spinner.tsx         tamanhos: sm | md | lg
Toast.tsx           bottom-right (desktop) | bottom-center (mobile)
                    tipos: success | error | info | warning | auto-dismiss
ThemeToggle.tsx     ícone sol/lua com transição suave
LanguageToggle.tsx  toggle PT | EN
EmptyState.tsx      SVG contextual + título + descrição + CTA
ConfirmDialog.tsx   modal de confirmação para ações destrutivas
FileUpload.tsx      drag-and-drop + click, preview de imagem, limite de tamanho
```

### `/frontend/src/hooks/useTheme.ts`
```typescript
// Prioridade: localStorage → prefers-color-scheme → light
// Aplica data-theme no <html>
export function useTheme(): {
  theme: 'light' | 'dark',
  toggleTheme: () => void,
  setTheme: (t: 'light' | 'dark') => void
}
```

### Critérios de Aceite
- [ ] Alternância Dark/Light funciona e persiste no reload
- [ ] Todos os componentes usam CSS variables (sem cores hardcoded)
- [ ] Toast aparece e desaparece com animação
- [ ] Todos os estados implementados: default, hover, focus, disabled, loading, error

---

## 🌐 ETAPA 7 — Frontend: Internacionalização (PT/EN)

**Objetivo:** Sistema bilíngue completo com alternância em tempo real, sem reload.

### Estrutura

```typescript
// /frontend/src/i18n/pt.ts e en.ts
// ZERO strings hardcoded em componentes — tudo via t('chave')

export const pt = {
  nav: { dashboard, bookings, animals, tutors, services, calendar, settings },
  booking: {
    status: { scheduled, checkin, checkout, cancelled, pending, paid, partial },
    fields: { animal, tutor, checkin_date, checkout_date, total, services }
  },
  contract: {
    status: { generated, viewed, signed, expired },
    signing: {
      title, subtitle, accept_label, canvas_label, canvas_hint,
      name_label, name_placeholder, clear_button, confirm_button,
      canvas_empty_error, terms_error, name_error,
      success_title, success_message, download_pdf,
      invalid_token, invalid_token_hint, already_signed
    }
  }
  // ... demais seções
}
```

### `/frontend/src/hooks/useTranslation.ts`
```typescript
// Dot notation: t('contract.signing.title')
// Interpolação: t('booking.total', { value: '400,00' })
// Fallback para PT se chave ausente em EN
// Persistência no localStorage
```

### Critérios de Aceite
- [ ] Zero strings hardcoded em componentes
- [ ] Alternância imediata em toda a interface incluindo página de assinatura
- [ ] Cláusulas do contrato na página de assinatura também são traduzidas

---

## 🏠 ETAPA 8 — Frontend: Layout Principal e Navegação

### AppShell
- Desktop: sidebar fixa 240px + área de conteúdo
- Mobile: sidebar como drawer (hamburger menu)
- Header: logo do estabelecimento (ou 🐾 padrão), nome, ThemeToggle, LanguageToggle

### Roteamento Completo

```typescript
// Rota de onboarding (SEM AppShell — tela isolada, só aparece uma vez):
/setup               → OnboardingPage
                       Redireciona para /setup se settings.onboarding_completo === false
                       Após concluir, seta onboarding_completo: true e redireciona para /

// Rotas admin (com AppShell — só acessíveis após onboarding):
/                    → DashboardPage
/bookings            → BookingsPage
/bookings/new        → BookingFormPage
/bookings/:id        → BookingDetailPage
/animals             → AnimalsPage
/animals/:id         → AnimalDetailPage
/tutors              → TutorsPage
/tutors/:id          → TutorDetailPage
/services            → ServicesPage
/calendar            → CalendarPage
/settings            → SettingsPage  ← versão de edição (mesmo conteúdo, sem bloqueio)

// Rotas públicas (SEM AppShell):
/assinar             → SigningPage  (?t=TOKEN)
/verificar           → VerifyPage   (?h=HASH)
```

### Critérios de Aceite
- [ ] Navegação SPA sem reload de página
- [ ] Sidebar fecha ao navegar no mobile
- [ ] `/assinar` e `/verificar` não exibem sidebar
- [ ] **Qualquer rota admin redireciona para `/setup` se `onboarding_completo === false`**
- [ ] Após concluir o onboarding, `/setup` redireciona para `/` e nunca mais aparece sozinho
- [ ] 404 customizado

### VerifyPage (`/verificar?h=HASH`)

Página pública e simples, acessada ao escanear o QR Code do PDF impresso. Exibe apenas:

```
┌─────────────────────────────┐
│  [Logo]  NOME HOTEL         │
│                             │
│  ✅ Contrato Autêntico      │  ← ou ❌ Hash não encontrado
│                             │
│  Estabelecimento: ________  │
│  Pet: ____________________  │
│  Assinado por: ___________  │
│  Data: ___________________  │
│                             │
│  Este documento foi         │
│  assinado digitalmente e    │
│  seus dados são autênticos. │
└─────────────────────────────┘
```

Não exibe: assinatura PNG, IP completo, token UUID nem qualquer dado interno.

> ⚠️ **Fallback offline:** O QR Code exige que o servidor esteja online. Por isso, o PDF final deve também imprimir o hash SHA-256 completo em texto no rodapé, permitindo verificação manual mesmo sem internet — basta comparar o hash impresso com os dados registrados no painel admin.

---

## 🎉 ETAPA 9 — Frontend: Onboarding (Configuração Inicial do Hotel)

**Objetivo:** Criar a tela de boas-vindas que aparece na primeira abertura do sistema, guiando o dono do hotelzinho a configurar sua identidade antes de usar qualquer funcionalidade.

> 💡 **Identidade dupla:** O sistema se chama **PetStay Manager** (marca do software open source). O hotel tem seu próprio nome, logo e cores — definidos aqui. Após o onboarding, o painel exibe apenas a identidade do hotel, não a do sistema.

### Lógica de Exibição

```typescript
// Em App.tsx — guard de rota aplicado a TODAS as rotas admin
// Executado antes de renderizar qualquer página do painel

async function checkOnboarding() {
  const settings = await api.get('/api/settings');
  if (!settings.onboarding_completo) {
    redirect('/setup');
  }
}

// A rota /setup é acessível sempre (para edição futura via /settings → "Editar Perfil do Hotel")
// A diferença entre onboarding e edição é apenas visual:
// - Onboarding: tela isolada, sem sidebar, tom de boas-vindas, botão "Começar"
// - Edição: dentro do painel normal em /settings, com sidebar, botão "Salvar"
```

### Layout da Tela de Onboarding (`/setup`)

```
┌─────────────────────────────────────────────┐
│                                             │
│   🐾  PetStay Manager                       │  ← marca do software (pequena, discreta)
│                                             │
│   ══════════════════════════════════════   │
│                                             │
│   Bem-vindo! Vamos configurar              │
│   o seu hotelzinho. 🏨                      │
│                                             │
│   Isso leva menos de 2 minutos.            │
│                                             │
│   ══════════════════════════════════════   │
│                                             │
│   PASSO 1 DE 3 — Identidade do Hotel       │
│   ● ○ ○                                    │  ← indicador de progresso
│                                             │
│   📸 Logo do Hotel                         │
│   ┌─────────────────────────────────────┐  │
│   │  Arraste uma imagem ou clique aqui  │  │
│   │  PNG, JPG ou WebP · máx. 2MB        │  │
│   └─────────────────────────────────────┘  │
│   [Preview do logo aparece aqui]           │
│                                             │
│   🏷️ Nome do Hotel *                       │
│   ┌─────────────────────────────────────┐  │
│   │  Ex: Hotel Patinhas, Casa do Rex... │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   🎨 Cor Principal *                       │
│   [ 🟠 ] [ 🟢 ] [ 🔵 ] [ 🟣 ] [ 🔴 ]      │  ← paleta de cores rápidas
│   Ou escolha uma cor personalizada: [___]  │
│                                             │
│              [Próximo →]                   │
│                                             │
└─────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────┐
│   PASSO 2 DE 3 — Contato e Localização     │
│   ○ ● ○                                    │
│                                             │
│   📞 Telefone / WhatsApp *                 │
│   ┌──────────────────┐                     │
│   │ (11) 99999-9999  │                     │
│   └──────────────────┘                     │
│                                             │
│   📍 Cidade *                              │
│   ┌──────────────────┐                     │
│   │ São Paulo - SP   │                     │
│   └──────────────────┘                     │
│                                             │
│   🌐 URL do Sistema (para links e QR Code) │
│   ┌─────────────────────────────────────┐  │
│   │ http://localhost:3001               │  │
│   └─────────────────────────────────────┘  │
│   ℹ️ Use seu domínio, IP da rede ou ngrok  │
│      para que clientes acessem de fora.    │
│                                             │
│   [← Voltar]              [Próximo →]      │
│                                             │
└─────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────┐
│   PASSO 3 DE 3 — Preferências              │
│   ○ ○ ●                                    │
│                                             │
│   💰 Valor da Diária Base                  │
│   ┌──────────┐                             │
│   │ R$ 80,00 │                             │
│   └──────────┘                             │
│                                             │
│   🌍 Idioma Padrão                         │
│   ( ) Português (BR)   ( ) English         │
│                                             │
│   🌙 Tema Padrão                           │
│   ( ) Claro   ( ) Escuro                   │
│                                             │
│   ══════════════════════════════════════   │
│                                             │
│   Preview da sua identidade:               │
│   ┌─────────────────────────────────────┐  │
│   │ [LOGO]  Hotel Patinhas              │  │
│   │ ████████████████  (cor escolhida)   │  │
│   └─────────────────────────────────────┘  │
│                                             │
│   [← Voltar]        [✅ Começar a usar!]   │
│                                             │
└─────────────────────────────────────────────┘
```

### Comportamento Após Concluir

```typescript
// Ao clicar em "Começar a usar!":
// 1. PUT /api/settings com todos os dados coletados nos 3 passos
// 2. PUT /api/settings com { onboarding_completo: true }
// 3. Animação de sucesso (confetti ou fade)
// 4. Redirecionar para /  (Dashboard)
// 5. O painel agora exibe nome e logo do hotel — não "PetStay Manager"
```

### Tela de Sucesso (transição para o painel)

```
┌─────────────────────────────────────────────┐
│                                             │
│          ✅                                 │
│                                             │
│   Tudo pronto, Hotel Patinhas!             │
│                                             │
│   Seu sistema está configurado             │
│   e pronto para receber hóspedes. 🐾       │
│                                             │
│        [Ir para o Painel]                  │
│                                             │
└─────────────────────────────────────────────┘
```

### Diferença entre Onboarding e Edição Posterior

| | Onboarding `/setup` | Edição `/settings` |
|---|---|---|
| Quando aparece | Primeira abertura (automático) | A qualquer momento (manual) |
| Layout | Tela isolada, sem sidebar | Dentro do painel normal |
| Tom | Boas-vindas, guiado por passos | Técnico, direto |
| Campos | Essenciais apenas | Todos os campos disponíveis |
| Botão final | "Começar a usar!" | "Salvar alterações" |
| Marca do sistema | Visível discretamente | Não aparece |

### Critérios de Aceite
- [ ] Na primeira abertura, qualquer rota redireciona para `/setup`
- [ ] Os 3 passos são validados individualmente (não avança com campos obrigatórios vazios)
- [ ] Preview da identidade (logo + nome + cor) atualiza em tempo real no passo 3
- [ ] Após concluir, `onboarding_completo: true` é salvo no backend
- [ ] `/setup` nunca redireciona automaticamente de volta se acessado manualmente depois (serve como edição)
- [ ] O painel exibe o nome e logo do **hotel**, não "PetStay Manager"
- [ ] Campo `base_url` tem tooltip explicando quando usar ngrok/domínio
- [ ] Responsivo em mobile (o dono pode configurar pelo celular)

---

## 📊 ETAPA 10 — Frontend: Dashboard

### KPIs (linha superior)
```
🐶 Hóspedes Agora | 📅 Check-ins Hoje | 📤 Check-outs Hoje | ⏳ Contratos Pendentes
```

### Seções
1. **Hóspedes Ativos** — cards com emoji, nome do pet, data de saída, badge status
2. **Agenda do Dia** — check-ins e check-outs com ações rápidas
3. **Contratos Pendentes de Assinatura** — botão "Copiar Link" (toast) + "WhatsApp"
4. **Próximas Reservas** — próximos 7 dias

### Template WhatsApp (URL encode para `wa.me`):
```
Olá [NOME_TUTOR]! 🐾
O contrato de hospedagem de *[NOME_PET]* está pronto para assinatura digital.

📋 *Resumo:*
• Check-in: [DATA_ENTRADA]
• Check-out: [DATA_SAIDA]
• Valor total: R$ [VALOR]

Acesse o link para assinar:
[LINK_COMPLETO]

— [NOME_ESTABELECIMENTO]
```

### Critérios de Aceite
- [ ] Dados reais da API, sem mocks
- [ ] Copiar link exibe toast de confirmação
- [ ] WhatsApp abre com template pré-preenchido
- [ ] Responsivo em 375px

---

## 📅 ETAPA 11 — Frontend: Gestão de Reservas

### BookingsPage
- Tabela: Pet, Tutor, Check-in, Check-out, Valor, Status Pagamento, Status Presença, Ações
- Filtros: status, intervalo de datas, busca por nome
- Botão "Nova Reserva"

### Formulário Multi-Step
```
Step 1: Selecionar/cadastrar tutor (busca autocomplete)
Step 2: Selecionar/cadastrar animal
Step 3: Datas + valor calculado em tempo real
         valor_total = (dias × diaria) + Σ(serviços selecionados)
Step 4: Serviços adicionais (checklist)
Step 5: Revisão e confirmação
```

### BookingDetailPage
- Dados completos + seção Contrato (status, link, WhatsApp, regerar link se expirado)
- Botões: Check-in, Check-out, Marcar como Pago, Cancelar
- Todos com ConfirmDialog

### Critérios de Aceite
- [ ] Valor recalcula em tempo real ao mudar datas ou serviços
- [ ] Datas bloqueadas desabilitadas no datepicker
- [ ] Status do contrato atualiza sem reload

---

## 🐾 ETAPA 12 — Frontend: Animais e Tutores

### AnimalDetailPage — Seções
1. Dados básicos (emoji grande por espécie)
2. Saúde (vacinas e alergias como tags adicionáveis)
3. Preferências (alimentação, comportamento)
4. Vacinação (FileUpload, galeria, download, remoção)
5. Histórico de estadias

### TutorDetailPage — Seções
1. Dados de contato (edição inline ou via formulário)
2. Animais cadastrados (cards com emoji)
3. Histórico de reservas

### Critérios de Aceite
- [ ] Upload com preview imediato
- [ ] Tags de vacinas/alergias adicionáveis e removíveis
- [ ] Histórico mostra todas as estadias anteriores

---

## ✍️ ETAPA 13 — Frontend: Página de Assinatura do Cliente

**Objetivo:** Landing page pública, mobile-first, para coleta da assinatura digital.

> ⚠️ CRÍTICO: Usada pelo cliente no celular. Falha de UX aqui = contrato não assinado.

### Estados da Página

- **Carregando**: spinner centralizado
- **Token inválido/expirado**: ícone de erro, mensagem clara, orientação para contatar o estabelecimento
- **Já assinado**: informativo + botão baixar PDF
- **Pronto para assinar**: (ver layout abaixo)
- **Sucesso**: confirmação + botão baixar PDF

### Layout Mobile-First

```
[Logo + Nome Estabelecimento]
─────────────────────────────────
📋 RESUMO DA HOSPEDAGEM
Pet: [Nome]     Entrada: [Data]
Saída: [Data]   Total: R$ [Valor]
─────────────────────────────────
📄 TERMOS E CONDIÇÕES
[Área scrollável com cláusulas completas]
─────────────────────────────────
✅ [ ] Li e aceito os termos e condições
─────────────────────────────────
✍️ ASSINE ABAIXO
[Canvas — largura 100%, height mínimo 150px]
[Botão: Limpar Assinatura]
─────────────────────────────────
📝 CONFIRME SEU NOME
[Input: "Digite seu nome completo"]
─────────────────────────────────
[Botão: ASSINAR CONTRATO]
← desabilitado até os 3 campos estarem válidos
```

### SignatureCanvas — Requisitos Técnicos Críticos

```typescript
// /frontend/src/components/signing/SignatureCanvas.tsx

// OBRIGATÓRIO:
// 1. Eventos touch E mouse simultâneos
//    touchstart, touchmove, touchend + mousedown, mousemove, mouseup
// 2. event.preventDefault() em todos os eventos touch
//    (evita scroll acidental ao desenhar)
// 3. requestAnimationFrame para suavidade em mobile
// 4. devicePixelRatio para nitidez em telas retina:
//    canvas.width  = containerWidth  * window.devicePixelRatio
//    canvas.height = containerHeight * window.devicePixelRatio
//    ctx.scale(devicePixelRatio, devicePixelRatio)
// 5. Fundo do canvas SEMPRE branco no export (para o PDF)
//    Aparência visual pode adaptar ao tema, mas toDataURL() sempre exporta com fundo branco
// 6. Detecção de canvas vazio:
//    const pixels = ctx.getImageData(0,0,w,h).data
//    vazio = pixels.every((v, i) => i % 4 === 3 ? v === 0 : true)
// 7. onSign() chamado ao levantar o dedo/mouse (touchend/mouseup)
// 8. ResizeObserver para redimenisionar sem perder o desenho
// 9. Linha: lineWidth=2, lineCap='round', lineJoin='round'
// 10. Cor da linha: tema light → #1C1917 | tema dark → #1C1917 (sempre escuro para o PDF)
```

### Validação (Frontend)

```typescript
const canSign =
  aceitouTermos === true &&
  !canvasEstaVazio() &&
  nomeDigitado.trim().length >= 3;

// Mostrar erro específico por campo não preenchido
// Botão desabilitado (não apenas cinza — usar aria-disabled também)
```

### Envio

```typescript
// POST /api/contracts/sign/:token
{
  assinatura_base64: canvas.toDataURL('image/png'),
  nome_digitado: string,
  aceite_termos: true
}
// Backend:
// 1. Salva a imagem PNG em /data/uploads/signatures/contrato_{id}_sig.png
// 2. Grava apenas o PATH no db.json (campo assinatura_path)
//    ⚠️ NUNCA gravar o base64 diretamente no db.json — pode ter 50-200KB por contrato
// 3. Captura IP e User-Agent do req
// 4. Gera hash SHA-256
// 5. Gera PDF final
```

### Critérios de Aceite
- [ ] Canvas funciona em iOS Safari e Android Chrome (touch)
- [ ] Scroll da página não interfere com o desenho
- [ ] Canvas vazio não é aceito (validação por pixels)
- [ ] Botão de confirmar desabilitado até os 3 campos válidos
- [ ] PDF disponível para download imediatamente após assinatura
- [ ] Página funciona sem login, apenas com token na URL
- [ ] Interface responsiva de 320px a 768px
- [ ] Idioma da página segue `settings.idioma_padrao`

---

## 📆 ETAPA 14 — Frontend: Calendário de Disponibilidade

### AvailabilityCalendar

**Legenda:** 🟢 Disponível | 🟡 Parcialmente ocupado | 🔴 Lotado/Bloqueado | ⬛ Bloqueado manualmente

**Funcionalidades:**
- Navegação mensal (anterior/próximo)
- Clique em dia → drawer com reservas do dia
- Botão "Bloquear Dia" com campo de motivo
- Tooltip com contagem de pets hospedados

**Dados:** `GET /api/bookings/calendar?mes=YYYY-MM` → `[{ data, bookings_count, bloqueado }]`

### Critérios de Aceite
- [ ] Indicador visual proporcional à ocupação
- [ ] Datas bloqueadas desabilitadas ao criar reserva
- [ ] Responsivo em mobile

---

## ⚙️ ETAPA 15 — Frontend: Configurações do Estabelecimento

### Seções

1. **Identidade Visual** — Upload logo (PNG/JPG/WebP até 2MB, salvo como arquivo em `/uploads/logo/`), nome, color picker
2. **Contato** — Telefone, cidade, endereço
3. **Reservas** — Diária base, moeda, validade do link (horas ou ilimitado)
4. **Sistema** — Idioma padrão, tema padrão
5. **Backup e Dados** — Backup manual, lista com restore, exportar JSON

**Preview em tempo real:** header atualiza nome/logo/cor antes de salvar.

### Critérios de Aceite
- [ ] Logo com preview imediato
- [ ] Cor primária reflete instantaneamente nos componentes
- [ ] Lista de backups com data/hora e botão de restore
- [ ] Configurações persistem após reload

---

## 🔧 ETAPA 16 — Ajustes Finais, Qualidade e Documentação

### Checklist de Qualidade

**Tratamento de Erros**
- [ ] Todas as chamadas de API têm estados de loading e erro
- [ ] Toast de erro em falhas de rede
- [ ] Erros de validação inline por campo
- [ ] Página 404 customizada

**Performance**
- [ ] Upload: comprimir imagens no frontend antes do envio
- [ ] Listas: paginação (20 itens por página)
- [ ] Busca: debounce 300ms

**Acessibilidade**
- [ ] Todos os inputs com `<label>` associado
- [ ] Contraste WCAG AA em ambos os temas
- [ ] Navegação por teclado funcional
- [ ] Canvas com `aria-label` descritivo

**Mobile (testar em 375px)**
- [ ] Zero scroll horizontal
- [ ] Canvas testado em touch real
- [ ] Tabelas com scroll horizontal quando necessário
- [ ] Modais dentro da viewport

**Segurança**
- [ ] Nenhum dado sensível em logs (produção)
- [ ] Upload valida MIME no backend
- [ ] IP e User-Agent gravados na assinatura

### Documentação Final

- **`README.md`**: instalação em 3 comandos, screenshots, link para issues
- **`docs/UPDATING.md`**: fluxo `git pull` + migração automática com exemplos de terminal. **Deve incluir obrigatoriamente uma seção "E se der conflito?"** explicando:
- O que é um merge conflict e por que acontece
- Como identificar arquivos em conflito (`git status`)
- A solução mais segura para usuários não-técnicos: fazer backup de `/data`, rodar `git fetch origin && git reset --hard origin/main` para aceitar a versão do repositório, e restaurar o backup de dados
- Como evitar no futuro: nunca editar arquivos fora de `/data` diretamente
- **`docs/MIGRATIONS.md`**: como criar, registrar e testar uma migração
- **`CONTRIBUTING.md`**: guia completo para novos colaboradores
- **`CHANGELOG.md`**: entrada completa da v1.0.0

---

## 📦 Dependências Resumidas

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "multer": "^1.4.5",
    "uuid": "^9.0.0",
    "pdfkit": "^0.13.0",
    "qrcode": "^1.5.0"
  },
  "devDependencies": { "nodemon": "^3.0.0" }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "vite": "^4.4.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
```

---

## 🚦 Ordem de Execução Recomendada

```
ETAPA  1 → Estrutura do projeto, scripts, .gitignore e docs iniciais
ETAPA  2 → Backend: DB, inicialização segura e sistema de migrações
ETAPA  3 → Backend: Todas as rotas REST com validação
ETAPA  4 → Backend: Fluxo de contratos (token, assinatura, hash SHA-256)
ETAPA  5 → Backend: Geração de PDF (rascunho + final com QR Code local)
ETAPA  6 → Frontend: Design system e componentes base
ETAPA  7 → Frontend: Internacionalização PT/EN
ETAPA  8 → Frontend: Layout, sidebar e roteamento (+ guard de onboarding)
ETAPA  9 → Frontend: Onboarding — configuração inicial do hotel ← PRIMEIRO contato do usuário
ETAPA 10 → Frontend: Dashboard com KPIs e ações rápidas
ETAPA 11 → Frontend: Gestão de reservas (formulário multi-step)
ETAPA 12 → Frontend: Perfis de animais e tutores
ETAPA 13 → Frontend: Página de assinatura ← CRÍTICO, testar no celular real
ETAPA 14 → Frontend: Calendário de disponibilidade
ETAPA 15 → Frontend: Configurações do estabelecimento (edição pós-onboarding)
ETAPA 16 → Qualidade, testes, polish e documentação final
```

---

## 💡 Dicas para o Claude Code

- Execute `npm run install:all` antes do primeiro `npm run dev`
- A pasta `/backend/data/` é criada automaticamente — nunca criar manualmente nem commitar
- Para testar o fluxo de assinatura: crie uma reserva via API → copie o token do contrato → acesse `http://localhost:5173/assinar?t=TOKEN`
- Para testar no celular durante o dev: use `vite --host` e acesse pelo IP local da rede
- Ao adicionar campos ao schema em qualquer PR, SEMPRE criar a migração correspondente
- O campo `version` no `db.json` é a única fonte da verdade para migrações — nunca editar manualmente

---

*PetStay Manager — Open Source com ❤️ para hotelzinhos pet*
*Contribuições são bem-vindas! Veja CONTRIBUTING.md para começar.*
