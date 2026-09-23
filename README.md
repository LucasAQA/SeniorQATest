# Senior QA Test

Repositório de automação de testes **E2E** e **API**, aplicando modelo de **Page Objects**, camadas de **Serviços**, **Helpers** para gestão de estado e isolamento de dados baseados em **Fixtures** visando maior manutenibilidade e legibilidade.

---

## Tecnologias Utilizadas

- **Cypress**
- **JavaScript**
- **Mochawesome Reporter**

---

## Estrutura do Projeto

O projeto segue uma arquitetura modular altamente escalável e de baixa manutenção:

```text
SeniorQATest/
├── cypress/
│   ├── e2e/
│   │   ├── api/          # Testes de contrato e integração de API (Auth, Cart, RBAC)
│   │   └── frontend/     # Testes E2E de interface (Checkout, CRUD Produtos, Segurança UI)
│   ├── fixtures/         # Massas de dados parametrizadas (user.json, product.json, messages.json)
│   └── support/
│       ├── api/          # Camada de abstração de requisições HTTP (Services)
│       ├── helpers/      # Gestão de estado, setup e teardown de dados
│       ├── pages/        # Padrão Page Object Model (POM) para mapeamento de telas
│       └── urls.js       # Centralização de rotas e endpoints de API
├── cypress.config.js     # Configurações globais do Cypress e do Reporter
└── package.json          # Dependências e scripts do projeto
```

## Configuração e Execução

### Pré-requisitos
Certifique-se de que tem os seguintes softwares instalados na sua máquina:
* **Node.js**
* **npm**

### 1. Instalação de Dependências
Clone o repositório para o seu ambiente local e, na raiz do projeto, execute o seguinte comando para instalar todas as dependências necessárias:

```bash
npm install
```

## Relatórios de Testes e Evidências

O projeto está configurado com o Cypress Mochawesome Reporter para gerar relatórios detalhados contendo o status de cada teste e capturas de tela (screenshots) automáticas caso algum teste venha a falhar.

Após a execução dos testes em modo headless, o relatório HTML unificado é gerado na pasta cypress/reports.
