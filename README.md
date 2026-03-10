# e-SUS XML Dashboard

Uma aplicação web 100% client-side desenvolvida em Next.js para processar, analisar e visualizar arquivos `.esus.xml` exportados pelo sistema e-SUS APS. Todo o processamento dos lotes XML é realizado na memória do navegador utilizando `DOMParser`, garantindo privacidade total (os dados não são enviados para nenhum servidor backend).

## Funcionalidades

- **Upload em Lote:** Selecione múltiplos arquivos `.xml` de uma só vez.
- **Identificação Automática:** Reconhece os tipos de ficha baseando-se na tag raiz do XML.
- **Extração Inteligente:**
  - Extrai UUID, CNES e Data de cada arquivo.
  - Conta os registros adequadamente conforme as regras corporativas de cada tipo de ficha.
- **Dashboard Dinâmico:**
  - **KPIs Principais:** Total de arquivos, registros/atendimentos computados e CNES únicos.
  - **Gráficos:** Gráfico de barras usando _Recharts_ para mostrar o breakdown de arquivos.
  - **Tabelas Detalhadas:**
    - Resumo por tipo de ficha, agrupando métricas específicas como Novas vs Atualizações.
    - Relação de CNES contendo volumetria e tipos de fichas remetidas.
- **Visualização Moderna:** Desenvolvida sobre um layout Dark Mode com cores vibrantes fornecido pelo Tailwind CSS.

## Tecnologias Utilizadas

- [Next.js](https://nextjs.org) (App Router)
- [React](https://reactjs.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Lucide React](https://lucide.dev/) (Ícones)

## Como Rodar Localmente

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.

1. Navegue até o diretório do projeto:
   ```bash
   cd "Ferramenta de Análise"
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Deploy no Vercel

O projeto foi criado explicitamente para ser compativeis com o ecossistema Vercel sem configurações adicionais complexas, por não necessitar de funções Serverless/Backend ou Banco de Dados.

1. Crie um repositório no GitHub para este projeto enviando todos os arquivos gerados.
2. Crie uma conta ou faça login em [Vercel](https://vercel.com).
3. Selecione "Add New Project" e importe o seu recém-criado repositório via integração do Vercel com GitHub.
4. Clique em "Deploy". (O Vercel automaticamente detectará o Framework Next.js, rodará `npm install` e construirá os assets).

---
> Desenvolvido de acordo com as especificações exigidas para análise rápida dos lotes e-SUS em produção/transporte.
