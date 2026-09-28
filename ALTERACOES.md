# Atualização do portal

## Cadastro aplicado à base ativa

A lista de frequência fornecida pela equipe contém 32 nomes. Foram identificados 18 membros já cadastrados e adicionados os 14 faltantes, totalizando 36 contas. Os quatro membros existentes que não constam na lista foram mantidos.

As novas contas usam o nome completo como usuário, área **Geral**, sem e-mail e sem acesso de administrador. Cada uma recebeu uma senha individual aleatória, consultável pelos administradores em **Membros → Conta**. Nenhuma senha dos membros existentes foi alterada. Há 20 membros sem e-mail; a lista não fornece esses endereços nem as áreas.

A conciliação foi executada localmente, com backup e controle de concorrência por ETag. Uma segunda execução confirmou que não há mais nomes a adicionar. O arquivo da lista, o script operacional com os nomes completos e o backup dos cadastros não fazem parte desta publicação.

## Código pronto para publicar

Publique **index.html e email-queue.js juntos**, na mesma pasta do site. O cadastro já foi atualizado no Firebase; as melhorias da interface e do envio estão neste repositório e ainda não foram publicadas no site original da GaiaRobotca.

- Fila única para avisos, eventos, avaliações e testes, com intervalo entre mensagens e tentativas limitadas após erro 429. A documentação do [EmailJS](https://www.emailjs.com/docs/sdk/send/) informa o limite de uma requisição por segundo.
- Falhas por destinatário aparecem em **Config. E-mail → Ver pendências** durante a sessão. O resultado dos avisos também é salvo no Firebase; aceite pelo serviço não significa confirmação de entrega na caixa de entrada.
- Endereços repetidos são deduplicados em cada envio; membros sem endereço válido são contabilizados e identificados.
- Lembretes são enviados por sessões administrativas, com recibos em `gaia_email_deliveries` para impedir que várias sessões enviem o mesmo lembrete. As regras do Firebase precisam permitir as transações nessa coleção; erros de permissão aparecem no relatório.
- Um recibo que permaneça em `sending` após fechar a aba impede reenvio automático. Confira o histórico do provedor antes de liberar esse recibo; não há confirmação automática para envios interrompidos.
- Lembretes dependem de um administrador com o portal aberto no dia do alerta. Um agendador de servidor seria necessário para garantir execução com o site fechado.
- Área **Geral** no painel, filtro de membros e edição de conta; seleção de destinatários com as áreas atuais, validação de e-mail e prevenção de nomes de usuário duplicados.
- O salvamento geral preserva os registros de presença online e sessões. A arquitetura original ainda salva coleções completas, portanto não resolve todos os conflitos entre edições simultâneas.

No painel do EmailJS, o campo **To Email** do template deve ser `{{to_email}}`, o assunto `{{notice_title}}` e o corpo deve usar `{{to_name}}` e `{{notice_body}}`. Um destinatário fixo no template impede a distribuição correta mesmo com a fila corrigida. Essa configuração externa não foi alterada nem validada com envio real.

## Verificação

`node --test tests/email.test.cjs`: cinco testes automatizados passaram, cobrindo sintaxe, validação, intervalo, isolamento de falhas e tentativas limitadas.

`node tests/browser.cjs`: teste em Microsoft Edge via Playwright, com Firebase e EmailJS simulados. Verifica login, área Geral, validação de cadastro, relatórios, deduplicação, recibos e status de falha nos avisos. Requer o pacote `playwright` disponível no Node. Nenhuma mensagem real é enviada pelos testes.
