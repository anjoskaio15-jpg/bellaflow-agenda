# BellaFlow Agenda

Micro SaaS de agendamento inteligente para profissionais de beleza.

## Configuracao

1. Instale as dependencias:

```bash
npm install
```

2. Crie `.env` a partir de `.env.example`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

3. Execute o SQL em `supabase/schema.sql` no Supabase.

4. Rode o projeto:

```bash
npm run dev
```

## Rotas

- `/cliente/:slug`: agendamento publico
- `/login`: autenticacao por e-mail e senha
- `/profissional`: dashboard protegido
- `/dev`: dashboard protegido para role `agency`, `dev` ou `owner`
