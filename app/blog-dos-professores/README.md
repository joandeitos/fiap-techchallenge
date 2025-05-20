# Blog dos Professores 📚

Este é um aplicativo React Native/Expo que permite aos professores compartilhar e gerenciar conteúdo educacional.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Para desenvolvimento Android:
  - [Android Studio](https://developer.android.com/studio)
  - Um emulador Android configurado
- Para desenvolvimento iOS (apenas em macOS):
  - [Xcode](https://developer.apple.com/xcode/)
  - [iOS Simulator](https://developer.apple.com/simulator/)

## Instalação

1. Clone o repositório e navegue até a pasta do projeto:
   ```bash
   cd app/blog-dos-professores
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

## Executando o Aplicativo

### Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm start
```

Após iniciar, você terá as seguintes opções:

- Pressione `a` para abrir no emulador Android
- Pressione `i` para abrir no simulador iOS
- Escaneie o QR code com o aplicativo Expo Go no seu celular
- Pressione `w` para abrir na versão web

### Comandos Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run android` - Inicia o aplicativo no emulador Android
- `npm run ios` - Inicia o aplicativo no simulador iOS
- `npm run web` - Inicia o aplicativo na versão web
- `npm run lint` - Executa a verificação de código com ESLint
- `npm test` - Executa os testes automatizados
- `npm run clear-cache` - Limpa o cache do Expo e reinicia o servidor

## Testando o Aplicativo

### Testes Automatizados

Para executar os testes:

```bash
npm test
```

### Testes Manuais

1. **Teste em Dispositivo Físico**:
   - Instale o aplicativo Expo Go na Play Store (Android) ou App Store (iOS)
   - Escaneie o QR code que aparece no terminal após executar `npm start`

2. **Teste em Emulador**:
   - Android: Use o Android Studio para criar e gerenciar emuladores
   - iOS: Use o Xcode para acessar o simulador iOS

## Estrutura do Projeto

- `/app` - Contém as rotas e páginas do aplicativo
- `/components` - Componentes reutilizáveis
- `/hooks` - Custom hooks
- `/types` - Definições de tipos TypeScript

## Tecnologias Utilizadas

- React Native
- Expo
- TypeScript
- React Navigation
- Expo Router

## Suporte

Se você encontrar algum problema ou tiver dúvidas, por favor:

1. Verifique a [documentação do Expo](https://docs.expo.dev/)
2. Consulte os [issues do projeto](link-para-issues)
3. Entre em contato com a equipe de desenvolvimento
