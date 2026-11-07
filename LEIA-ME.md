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
3. Clique na engrenagem (**Configurações do projeto**). Em **Propriedades do script**, adicione uma propriedade com nome `PIN` e um valor numérico, por exemplo `482915`. Esse é o PIN que o André vai digitar no app.
4. Clique em **Implantar > Nova implantação**. No tipo, escolha **App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Clique em **Implantar**, autorize o acesso com a sua conta Google e copie o **URL do app da Web** (termina com `/exec`).
6. No GitHub, abra o `config.js`, clique no lápis para editar, cole o URL entre as aspas de `API_URL` e clique em **Commit changes**.

Na próxima vez que o app abrir, ele pede o PIN e carrega o catálogo da planilha.

> "Qualquer pessoa" pode chamar o endereço, mas sem o PIN a planilha não devolve nada nem aceita pedidos. O PIN fica guardado só no Apps Script, nunca no código do GitHub.

## 4. Instalar no celular do André

- **Android (Chrome):** abra o link, toque nos três pontinhos e em **Instalar app** (ou **Adicionar à tela inicial**).
- **iPhone (Safari):** abra o link, toque em **Compartilhar** e em **Adicionar à Tela de Início**.

O ícone aparece junto dos outros apps. Na primeira vez é preciso internet; depois o app abre sem sinal.

## Como funciona no dia a dia

- **Mudar preço ou produto:** edita na planilha e, no app, vai em **Catálogo > Atualizar catálogo**. O app também atualiza sozinho ao abrir com internet.
- **Sem internet:** o pedido é fechado normalmente e fica marcado como **Aguardando internet**. Quando o sinal volta, ele vai para a planilha sozinho e passa a **Na planilha**. O mesmo pedido nunca entra duas vezes.
- **Enviar para a empresa:** no pedido, **Enviar no WhatsApp**, **Baixar ou enviar PDF** (no celular abre o menu de compartilhar, dá para mandar o PDF direto no WhatsApp) ou **Copiar pedido**.
- **Produto que saiu de linha:** na planilha, coloque **Não** na coluna Ativo.

## Se mudar o Code.gs depois

Em **Implantar > Gerenciar implantações**, clique no lápis, escolha **Nova versão** e implante. Assim o endereço continua o mesmo e não precisa mexer no `config.js`.

## Cuidados

- O repositório é público: qualquer pessoa pode ver o código do app, mas não os dados, que ficam na planilha protegida pelo PIN. Por isso, **nunca suba a planilha nem o Code.gs** no GitHub.
- Não compartilhe a planilha como "qualquer pessoa com o link".
- Para trocar o PIN, mude a propriedade `PIN` no Apps Script. O app vai pedir o PIN novo.
