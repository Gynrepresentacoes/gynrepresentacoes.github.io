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

## Relatórios (só administrador)

Aba **Relatórios** do app. Escolha o período (ou use os atalhos Hoje, 7 dias, Este mês, Mês passado, Este ano), a empresa, o vendedor e a situação, e toque em **Gerar relatório**. Aparecem:

- totais (pedidos, itens, valor, lojas atendidas);
- **itens mais pedidos** (quantidade e valor por produto);
- **por loja**;
- **histórico detalhado**: data, pedido, loja, vendedor, produto, quantidade, total e situação.

**Baixar PDF** gera o relatório em A4 deitado. **Baixar Excel** gera uma planilha com as abas Histórico detalhado, Por produto, Por loja e Resumo. O histórico é sempre o da planilha: dá para consultar qualquer período desde o primeiro pedido. Precisa de internet.

## Configuração por marca, vendedor e loja (colunas da planilha)

Use uma vez o menu **Pedidos > Preparar colunas novas**: ele cria as colunas que faltam. Depois preencha:

| Aba | Coluna | Para quê |
|---|---|---|
| Empresas | **E-mail** | para onde o pedido aprovado vai (pode ter mais de um, separados por ;) |
| Empresas | **Comissão %** | quanto a marca paga à GYN (relatório de comissão) |
| Empresas | **Pedido mínimo** | valor mínimo do pedido para vendedores |
| Empresas | **Desconto máx %** | desconto máximo que o vendedor pode dar (0 ou vazio = sem desconto) |
| Empresas | **Pagamentos** | formas de pagamento da marca, separadas por ; (ex.: À vista; 28 dias; 28/56 dias) |
| Usuarios | **E-mail** | avisos automáticos (administrador: pedidos e lojas para aprovar; vendedor: situação dos pedidos) |
| Usuarios | **Comissão %** | quanto a GYN paga ao vendedor |
| Clientes | CNPJ, Telefone, Contato, Endereço, Situação, Cadastrado por | preenchidas pelo app quando alguém cadastra uma loja |
| Clientes | **Grupo** | nome da rede, igual em todas as filiais do mesmo dono (vazio = loja única) |
| Grupos (aba) | **Grupo**, **Desconto %**, **Pagamento**, **Observação** | condição combinada com a rede inteira (opcional) |
| Fotos (aba) | **ID**, **Foto** | endereço da foto de cada produto (ou a coluna Foto na aba Produtos) |

## Ciclo do pedido

Aguardando aprovação → **Aprovado** → **Enviado ao fornecedor** → **Faturado** (com o nº da NF) → **Entregue**.

- Ao aprovar, o pedido vai sozinho por **e-mail para a marca**, com PDF anexo e cópia para os administradores, e passa a "Enviado ao fornecedor". Marca sem e-mail: o pedido fica "Aprovado" e o app avisa para enviar por WhatsApp e marcar como enviado.
- No detalhe do pedido, o administrador registra o faturamento (NF) e a entrega.
- O Gmail gratuito envia até cerca de 100 e-mails por dia.

## Lojas

- **Cadastro pelo app** (botão "+ Nova loja"): a loja entra na hora para o vendedor fazer o pedido e aparece para o administrador aprovar (aba Aprovar).
- **Aba Lojas**: lojas paradas (sem pedido há 30, 60, 90 dias), nunca compraram, contato com botões Ligar e WhatsApp, pedidos recentes, "Novo pedido para esta loja" e "Repetir último pedido".

## Redes (cliente com vários CNPJs)

Cada CNPJ é uma loja própria (a nota sai para ele). As filiais de um mesmo dono ficam ligadas pela coluna **Grupo** da aba Clientes.

- **Juntar lojas numa rede**: escreva o mesmo nome na coluna Grupo de cada filial, ou, no app (administrador), abra a loja e toque em **Colocar numa rede**.
- **Cadastrar filial**: abra a loja e toque em **+ Adicionar filial (outro CNPJ)**. O app já traz rede, nome, cidade, contato e telefone; é só digitar o CNPJ e acertar o que mudar. Se a loja ainda não era de rede, ela entra junto na rede nova. No cadastro de loja nova também há o campo **Rede / grupo**.
- **Escolher o cliente**: a lista mostra cada rede como um título com os CNPJs embaixo. O campo **Buscar cliente, rede ou CNPJ** filtra a lista (dá para digitar só um pedaço do CNPJ).
- **Condição da rede** (opcional): na aba **Grupos** (criada pelo menu Pedidos > Preparar colunas novas), uma linha por rede com Desconto %, Pagamento e Observação. Ao escolher uma filial, o app mostra a condição, já preenche o desconto e o pagamento, e o vendedor pode dar até esse desconto, mesmo que a marca permita menos.
- **Pedido para várias filiais**: monte o pedido e toque em **Fechar para várias filiais da rede…** (no resumo do computador ou em Revisar pedido no celular). Marque as filiais; em **Ajustar quantidades** você muda a quantidade de cada item só para aquela filial (0 tira o item). Cada filial vira um pedido com número próprio, e o pedido mínimo da marca vale para cada uma.
- **Aba Lojas > Por rede**: um cartão por rede com o total das filiais e quantas estão paradas. Tocando nele aparecem as filiais e a condição da rede.
- **Relatórios**: filtro **Rede / grupo**, a tabela **Por rede (soma das filiais)** e as colunas CNPJ e Rede no PDF e no Excel. O PDF do pedido mostra o CNPJ do cliente.

## Orçamentos, desconto e repetir pedido

- **Salvar como orçamento** (na revisão do pedido): gera PDF de orçamento e fica no filtro **Orçamentos** da aba Pedidos, neste aparelho. "Transformar em pedido" carrega tudo no Novo pedido.
- **Desconto (%)** no fechamento, limitado pelo "Desconto máx %" da marca (o administrador não tem limite).
- **Repetir último pedido** aparece ao escolher a loja: carrega os itens do último pedido com os mesmos preços de venda e o mesmo desconto do pedido. Se um preço antigo ficou abaixo do mínimo permitido hoje (a tabela subiu), esse item volta ao preço da tabela e o app avisa.
- **Copiar pedido**: só copia o texto do pedido (para colar no WhatsApp, e-mail etc.). Não muda nem reenvia nada.

## Comissão

No relatório, as seções **Comissão por marca** (a receber) e **Comissão por vendedor** (a pagar) usam os percentuais das abas Empresas e Usuarios sobre o valor dos pedidos já com desconto. Para considerar só o que foi faturado, escolha a situação "Só faturados e entregues".

## Importar preços

Cole na aba **Importar preços** o código (coluna A) e o preço (coluna B) da tabela da marca; se o mesmo código existir em duas marcas, informe a Empresa (coluna C). Depois use **Pedidos > Importar preços**. O código pode ser o do fornecedor (ex.: 74/J, UNF123) ou o ID do app (PMK-74/J). A coluna Resultado mostra o que foi atualizado.

## Cópia de segurança

**Pedidos > Ativar cópia semanal automática**: toda segunda, por volta das 7h, uma cópia da planilha vai para a pasta "Cópias de segurança" do Drive (ficam as 8 mais recentes). **Fazer cópia de segurança agora** faz uma na hora.

## Quantidade no pedido

**−** e **+** mudam de 1 em 1, **+10** soma dez de uma vez, e o número pode ser digitado (toque nele e digite, por exemplo, 50). Digitar 0 tira o item do pedido.

## Preço de venda, pagamento "Outro" e limpar

- **Preço de venda:** no resumo do pedido (ao lado, no computador; em "Revisar pedido", no celular), cada item tem um campo com o preço, já preenchido com o da tabela. Digite o valor que vai vender. O item com preço mudado fica destacado e mostra o preço de tabela para comparar. O vendedor não pode ficar abaixo da tabela menos o "Desconto máx %" da marca; o administrador não tem limite. O preço digitado vai para o total, o PDF, o WhatsApp e a planilha (aba Itens).
- **Desconto em um item só:** ao lado do preço, o campo **desc. %** dá desconto só naquele item (ex.: 10 = 10% a menos que a tabela). Preço e % andam juntos: mudando um, o outro se ajusta. O desconto do pedido (campo Desconto %) continua valendo para o pedido todo. Para o vendedor, o desconto do item somado ao do pedido não pode passar do "Desconto máx %" da marca (ou da rede); o app avisa antes de fechar. Produto sem preço na planilha (R$ 0,00): digite no campo R$ o preço cheio; o desc. % daquele item é calculado sobre ele (aparece "com desconto: R$ X cada").
- **Pagamento "Outro…":** a última opção da lista abre um campo para digitar a forma de pagamento.
- **Limpar pedido:** tira todos os itens de uma vez (no resumo do computador, na barra do carrinho e na revisão do celular).

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
- **Categorias:** a coluna **Categoria** da aba Produtos agrupa os produtos no app (seletor de categoria no Novo pedido e seções no Catálogo). Pode criar categorias novas à vontade: basta escrever o nome.
- **Busca:** acha o produto se todas as palavras digitadas aparecerem no nome, código ou categoria, em qualquer ordem. Sem empresa escolhida, busca nas três; ao adicionar um item, a empresa é escolhida sozinha.

## Se mudar o Code.gs depois

Em **Implantar > Gerenciar implantações**, clique no lápis, escolha **Nova versão** e implante. Assim o endereço continua o mesmo e não precisa mexer no `config.js`.

## Cuidados

- O repositório é público: qualquer pessoa pode ver o código do app, mas não os dados, que ficam na planilha protegida pelo login. Por isso, **nunca suba a planilha nem o Code.gs** no GitHub.
- Não compartilhe a planilha como "qualquer pessoa com o link".
- O Apps Script cria sozinho uma propriedade `SEGREDO` (em Configurações do projeto > Propriedades do script). Não apague nem compartilhe. Se apagar, todo mundo precisa entrar de novo.
- A propriedade `PIN` da versão antiga não é mais usada e pode ser apagada.
