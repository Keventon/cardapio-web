# Fast Burguer | Cardápio Digital

Aplicação web de cardápio para hamburgueria, criada com React, TypeScript, Vite, Tailwind CSS v4, Radix UI, React Hook Form e Zod.

## Funcionalidades

- Listagem de produtos por categoria.
- Detalhe do produto com galeria, adicionais, observações e quantidade.
- Carrinho funcional com incremento, decremento, remoção e total calculado.
- Checkout com seleção de entrega/retirada, dados do cliente, endereço e pagamento.
- Validação com React Hook Form e Zod antes da confirmação do pedido.
- Máscara de telefone nos formulários.
- Pagamento em dinheiro com opção de troco.
- Perfil com dados do cliente, CEP com consulta ViaCEP e endereços persistidos em `localStorage`.

## Scripts

Instale os pacotes:

```bash
npm ci
```

Depois rode o projeto em modo de desenvolvimento:

```bash
npm run dev
```

Abra no navegador:

```text
http://localhost:5173
```

Outros comandos disponíveis:

```bash
npm run lint
npm run build
npm run preview
```

## Estrutura

- `src/data/menu.ts`: catálogo de produtos e categorias.
- `src/types/menu.ts`: tipos compartilhados do cardápio e carrinho.
- `src/components/menu`: cardápio, produto, carrinho e navegação de categorias.
- `src/components/checkout`: fluxo de finalização do pedido.
- `src/components/profile`: perfil e endereços do cliente.
- `src/utils/currency.ts`: formatação e cálculo de valores.
