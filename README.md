# VK Manager

[![build status](https://img.shields.io/travis/knoxzin1/vk-manager/master.svg?style=flat-square)](https://travis-ci.org/knoxzin1/vk-manager)
[![Build status](https://ci.appveyor.com/api/projects/status/d5fc977wxepw0h9u/branch/master?svg=true)](https://ci.appveyor.com/project/knoxzin1/vk-manager/branch/master)
[![dependencies Status](https://david-dm.org/knoxzin1/vk-manager/status.svg)](https://david-dm.org/knoxzin1/vk-manager)
[![devDependencies Status](https://david-dm.org/knoxzin1/vk-manager/dev-status.svg)](https://david-dm.org/knoxzin1/vk-manager?type=dev)

Extensão para o site vk.com

* Atualiza o tópico ao clicar em "Quadro de Discussão"
* Rola os posts automaticamente nos tópicos se estiver clicada a caixa de escrever comentários ( opcional )

## Desenvolvendo

Clone o repositório e instale as depêndencias

`npm install`

Para gerar a extensão:

`npm run build:chrome`

ou

`npm run build:firefox`

## Testes

Copie o arquivo `config.json.example`para `config.json` e configure-o:

- testLogin: Login de alguma conta de teste
- testPassword: Senha de alguma conta de teste
- boardLink: Link para "Quadro de discussão" de alguma comunidade da conta acima
- topicLink: Link de um tópico que a conta tenha acesso, o tópico precisa ter um gif

### Comandos

`npm run lint`

e 

`npm test`
