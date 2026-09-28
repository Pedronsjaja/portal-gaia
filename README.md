# Portal Gaia

Portal da equipe GAIA para gestão de membros, tarefas, presença, horas, avisos e calendário, integrado ao Firebase e ao EmailJS.

Este repositório é uma cópia com histórico do [projeto original da GaiaRobotca](https://github.com/GaiaRobotca/portal-gaia), mantida na conta de [Pedro Henrique — @Pedronsjaja](https://github.com/Pedronsjaja).

## Colaboração e manutenção

**Pedro Henrique Barbosa de Freitas Soares (@Pedronsjaja)** — manutenção desta cópia, melhorias de cadastro e notificações por e-mail.

Os autores e colaboradores anteriores permanecem registrados no histórico Git. A identificação neste README não concede permissões no repositório original; os acessos são administrados separadamente no GitHub.

## Executar

Sirva esta pasta com um servidor estático e abra `index.html`. Mantenha `email-queue.js` junto ao HTML. Não há etapa de compilação.

O portal usa a configuração Firebase já presente no projeto e compartilha a mesma base da equipe; rodar esta cópia não cria uma base de testes. Os testes abaixo simulam os serviços externos e não alteram essa base.

## Testes

Com Node.js instalado:

```sh
node --test tests/email.test.cjs
```

Para o teste de interface, instale Playwright e tenha Microsoft Edge disponível:

```sh
npm install --no-save --package-lock=false playwright
node tests/browser.cjs
```

## Publicação e e-mails

Publique `index.html`, `email-queue.js` e `og-image.png` na mesma pasta. Enviar os arquivos ao GitHub não atualiza automaticamente o site da GaiaRobotca. Esta cópia não habilita GitHub Pages automaticamente.

Configure o destinatário do template EmailJS como `{{to_email}}`, o assunto como `{{notice_title}}` e o corpo com `{{to_name}}` e `{{notice_body}}`. Cadastre os endereços dos membros pendentes em **Config. E-mail**.

Consulte [ALTERACOES.md](ALTERACOES.md) para os resultados dos testes e as limitações dos lembretes.
