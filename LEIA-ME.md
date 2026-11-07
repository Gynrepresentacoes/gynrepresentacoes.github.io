# Pedidos do André: versão GitHub (app instalável)

App de pedidos que instala no celular com ícone próprio, abre em tela cheia e funciona sem internet. Os produtos e clientes vêm de uma planilha do Google, e os pedidos fechados caem nela.

Sem configurar nada, o app já roda em **modo demonstração**, com produtos de exemplo. Dá para subir no GitHub primeiro e ligar a planilha depois.

## O que tem no pacote

- `index.html`: o app.
- `config.js`: o único arquivo que você edita (endereço da planilha e nome do representante).
- `manifest.webmanifest`, `sw.js` e os ícones: fazem o app instalar e abrir offline.
- `Code.gs`: código que vai na planilha (não sobe no GitHub).

## 1. Subir no GitHub

1. Entre em github.com e clique em **New repository**. Nome sugerido: `pedidos-andre`. Deixe como **Public** (o GitHub Pages grátis exige repositório público).
2. Na página do repositório, clique em **Add file > Upload files** e arraste todos os arquivos, **menos** o `Code.gs` e a planilha. Clique em **Commit changes**.
3. Vá em **Settings > Pages**. Em **Branch**, escolha `main` e a pasta `/ (root)`. Clique em **Save**.
4. Em um ou dois minutos aparece o link, no formato `https://SEU-USUARIO.github.io/pedidos-andre/`.

Pronto: o app já abre em modo demonstração.

## 2. Preparar a planilha

1. Envie o arquivo `Planilha_Pedidos_Andre.xlsx` para o Google Drive, abra com o Planilhas Google e use **Arquivo > Salvar como Planilhas Google**.
2. Troque os dados de exemplo pelos reais: empresas, produtos com preço e clientes. Não mude os nomes das abas nem das colunas.

## 3. Ligar a planilha ao app

1. Na planilha, vá em **Extensões > Apps Script**.
2. Apague o que estiver lá, cole todo o conteúdo do `Code.gs` e salve.
3. Crie os usuários (veja **Usuários e senhas**, logo abaixo).
4. Clique em **Implantar > Nova implantação**. No tipo, escolha **App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Clique em **Implantar**, autorize o acesso com a sua conta Google e copie o **URL do app da Web** (termina com `/exec`).
6. No GitHub, abra o `config.js`, clique no lápis para editar, cole o URL entre as aspas de `API_URL` e clique em **Commit changes**.

Na próxima vez que o app abrir, ele pede usuário e senha e carrega o catálogo da planilha.

> "Qualquer pessoa" pode chamar o endereço, mas sem um login válido a planilha não devolve nada nem aceita pedidos. As senhas ficam só na planilha, embaralhadas, nunca no código do GitHub.

## Usuários e senhas

Cada pessoa que cria pedidos tem o próprio usuário e senha. O nome dela aparece no topo do app, no PDF, na mensagem do WhatsApp e na coluna **Criado por** da aba Pedidos (a coluna é criada sozinha no primeiro pedido).

1. Na planilha, crie uma aba chamada **Usuarios** com estes cabeçalhos na linha 1:

   | Usuário | Nome | Senha | Ativo | Perfil |
   |---|---|---|---|---|
   | andre | André | (senha) | Sim | Administrador |
   | joao | João | (senha) | Sim | Vendedor |

2. Em cada linha, coloque o usuário (sem espaços, por exemplo `andre`), o nome que aparece no app e a senha.
3. **A senha se embaralha sozinha:** assim que você digita, a planilha troca a senha por um código que começa com `sha256$`. Ninguém consegue ler a senha depois, nem você. Se ela continuar visível (por exemplo, se colou várias de uma vez), use o menu **Pedidos > Proteger senhas digitadas**. O menu aparece depois de recarregar a planilha.

No dia a dia:

- **Trocar a senha de alguém:** digite a senha nova por cima do código. O celular dessa pessoa vai pedir login de novo.
- **Tirar o acesso:** coloque **Não** na coluna Ativo. O app dela para de enviar pedidos na hora.
- **Esqueceu a senha:** não dá para recuperar; digite uma nova.
- **Errou a senha 5 vezes seguidas:** o usuário fica bloqueado por 15 minutos.
- **Sair / trocar de pessoa no mesmo celular:** toque no nome no topo do app e em **Sair**. Pedidos que ainda estão aguardando internet só são enviados quando a mesma pessoa entrar de novo.
- O celular fica conectado por 90 dias. Depois, pede a senha de novo.

## Aprovação de pedidos

A coluna **Perfil** da aba Usuarios define o que cada um pode fazer. Em branco conta como Vendedor.

| | Vendedor | Administrador |
|---|---|---|
| Fazer pedidos | Sim, ficam **Aguardando aprovação** | Sim, já saem **Aprovados** |
| Ver pedidos | Só os dele | Os de todos, com o nome de quem fez |
| Aprovar ou recusar | Não | Sim, na aba **Aprovar** (recusa com motivo opcional) |
| Cancelar | Os dele, enquanto aguardam aprovação | Qualquer pedido |

- Na aba **Pedidos** da planilha, a coluna **Status** é atualizada sozinha, e as colunas **Atualizado por**, **Atualizado em** e **Motivo** registram quem mudou e quando. Pedidos cancelados continuam na planilha.
- Aprovar, recusar e cancelar precisam de internet. Pedido que ainda está **Aguardando internet** pode ser cancelado no próprio celular e não é mais enviado.
- A situação nova aparece quando o app é aberto ou ao tocar em **Atualizar** na aba Pedidos. Não há notificação no celular.
- Não mude a situação direto na coluna Status da planilha; use o app, que confere as regras.

## 4. Instalar no celular do André

- **Android (Chrome):** abra o link, toque nos três pontinhos e em **Instalar app** (ou **Adicionar à tela inicial**).
- **iPhone (Safari):** abra o link, toque em **Compartilhar** e em **Adicionar à Tela de Início**.

O ícone aparece junto dos outros apps. Na primeira vez é preciso internet; depois o app abre sem sinal.

## Como funciona no dia a dia

- **Celular ou computador:** o mesmo link serve para os dois. Em tela larga (computador, 1000px ou mais) as abas ficam no topo, o resumo do pedido fica fixo ao lado dos produtos e as janelas abrem no centro. No celular, continua o layout com abas embaixo.
- **Número do pedido:** leva o usuário de quem fez na frente (ex.: `JOAO-1001`), então dois vendedores nunca têm o mesmo número. Se a pessoa usar outro aparelho, a contagem continua de onde parou na planilha.
- **Mudar preço ou produto:** edita na planilha e, no app, vai em **Catálogo > Atualizar catálogo**. O app também atualiza sozinho ao abrir com internet.
- **Sem internet:** o pedido é fechado normalmente e fica marcado como **Aguardando internet**. Quando o sinal volta, ele vai para a planilha sozinho e passa a **Na planilha**. O mesmo pedido nunca entra duas vezes.
- **Enviar para a empresa:** no pedido, **Enviar no WhatsApp**, **Abrir ou imprimir PDF**, **Baixar ou enviar PDF** (no celular abre o menu de compartilhar, dá para mandar o PDF direto no WhatsApp) ou **Copiar pedido**.
- **Produto que saiu de linha:** na planilha, coloque **Não** na coluna Ativo.

## Se mudar o Code.gs depois

Em **Implantar > Gerenciar implantações**, clique no lápis, escolha **Nova versão** e implante. Assim o endereço continua o mesmo e não precisa mexer no `config.js`.

## Cuidados

- O repositório é público: qualquer pessoa pode ver o código do app, mas não os dados, que ficam na planilha protegida pelo login. Por isso, **nunca suba a planilha nem o Code.gs** no GitHub.
- Não compartilhe a planilha como "qualquer pessoa com o link".
- O Apps Script cria sozinho uma propriedade `SEGREDO` (em Configurações do projeto > Propriedades do script). Não apague nem compartilhe. Se apagar, todo mundo precisa entrar de novo.
- A propriedade `PIN` da versão antiga não é mais usada e pode ser apagada.
