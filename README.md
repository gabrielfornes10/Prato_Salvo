# Prato Salvo — Plataforma Completa

Front-end estático (HTML, CSS e JavaScript puros — sem frameworks e
sem build step) que une as quatro interfaces do Prato Salvo em uma
única plataforma navegável.

## Como abrir

Basta abrir `index.html` no navegador. Para evitar eventuais
restrições de `file://` em alguns navegadores ao carregar os
`<iframe>`, o ideal é servir a pasta com um servidor local simples:

```bash
cd prato-salvo
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

## Estrutura de pastas

```
prato-salvo/
├── index.html                  # shell/router: barra de navegação + iframes
├── README.md
├── assets/
│   └── shell/
│       ├── shell.css           # estilos da barra de navegação e do modal
│       └── shell.js            # lógica de troca de views + postMessage
└── pages/
    ├── landing/                # site institucional (ponto de entrada)
    │   ├── landing.html
    │   ├── landing.css
    │   ├── landing.js          # ticker de resgates + contadores animados
    │   └── landing-bridge.js   # conecta os CTAs da landing ao shell
    ├── cliente/                 # app do cliente (mockup mobile)
    │   ├── cliente.html
    │   ├── cliente.css
    │   ├── cliente.js           # busca, favoritos, navegação inferior
    │   └── cliente-bridge.js
    ├── fornecedor/               # portal do fornecedor
    │   ├── fornecedor.html
    │   ├── fornecedor.css
    │   └── fornecedor-bridge.js
    └── admin/                    # painel administrativo
        ├── admin.html
        ├── admin.css
        └── admin-bridge.js
```

## Arquitetura

### Por que `<iframe>` em vez de um único DOM?

As quatro páginas originais foram desenhadas de forma independente,
cada uma com seu próprio design system: variáveis CSS com o mesmo
nome (`--purple`, `--ink`, `--bg`...) mas valores diferentes, além
de seletores genéricos (`body`, `header`, `main`). Juntar tudo em um
único documento HTML causaria colisão de estilos.

A solução adotada foi isolar cada página em seu próprio `<iframe>`,
preservando o HTML/CSS/JS original de cada uma sem qualquer
adaptação de seletor. Isso garante:

- **Zero colisão de CSS/JS** entre as páginas.
- Cada página continua **100% funcional isoladamente** — é possível
  abrir `pages/cliente/cliente.html` diretamente no navegador e ela
  funciona sozinha, sem depender do shell.
- **Estado preservado** ao trocar de aba: os iframes não são
  recriados, apenas escondidos via `display:none`, então filtros,
  scroll e formulários preenchidos não se perdem.

### Como a navegação entre páginas funciona

1. `index.html` (o **shell**) define a barra fixa no topo e os 4
   `<iframe>`, cada um apontando para uma página em `pages/`.
2. `assets/shell/shell.js` controla qual `<iframe>` está visível e
   escuta mensagens (`window.addEventListener("message", ...)`).
3. Dentro de cada página, um arquivo `*-bridge.js` (ex.:
   `landing-bridge.js`) adiciona `id`s a elementos clicáveis
   relevantes (botões, cards, links) e, ao clique, dispara:
   ```js
   parent.postMessage({ psNav: "fornecedor" }, "*");
   ```
4. O shell recebe a mensagem e troca a view visível.

Essa comunicação via `postMessage` mantém as páginas desacopladas:
elas não importam nada do shell, apenas emitem eventos que podem ou
não ter um "ouvinte" — o que preserva a reutilização de cada página
fora deste projeto.

### Separação de responsabilidades dentro de cada página

Cada página tem, no mínimo, dois arquivos JS:

- `<pagina>.js` — comportamento **próprio** da página (ex.: busca no
  app do cliente, animação de contadores na landing). Não sabe nada
  sobre o restante da plataforma.
- `<pagina>-bridge.js` — **apenas** a integração com a navegação
  global (postMessage). Zero lógica de negócio.

Essa separação segue o princípio de responsabilidade única (SRP) e
facilita tanto a manutenção quanto a reutilização de cada peça.

## Pequenos ajustes feitos em relação aos arquivos originais

- Adição de `id`s em elementos de navegação (marca, botões de CTA,
  cards e links de rodapé) para servir de gancho aos arquivos
  `*-bridge.js` — nenhum estilo ou texto visível foi alterado.
- Adição de `<meta name="viewport">` nas páginas que não a possuíam
  (fornecedor, admin, cliente), para garantir renderização correta
  em telas de celular reais.
- CSS e JS que antes estavam inline (`<style>`/`<script>`) foram
  extraídos para arquivos próprios, comentados e organizados por
  página.
