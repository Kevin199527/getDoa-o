### Lifecycle Hook

No arquivo de lifecycle `afterCreate`, estamos chamando a função `getDoacao` do arquivo `Helpers/Utils.js`. A função é executada sempre que uma nova entrada é criada.

### Arquivo `lifecycle.js`

```javascript
module.exports = {
  async afterCreate(event) {
    const { getDoacao } = require("../../../../Helpers/Utils.js");
    await getDoacao(event, strapi);
  },
};
```
---

## Configurando o Lifecycle Hook no Strapi

Este guia irá mostrar como configurar um lifecycle hook no Strapi para chamar uma função personalizada sempre que uma nova entrada for criada.
---
### Passos

1. **Criar o Arquivo de Lifecycle**:
   Crie um arquivo `lifecycle.js` dentro da pasta do seu content type, em `./api/[content-type]/content-types/[content-type]/lifecycles.js`.

2. **Adicionar o Lifecycle Hook**:
   No arquivo `lifecycle.js`, adicione o seguinte código:

   ```javascript
   module.exports = {
     async afterCreate(event) {
       const { getDoacao } = require("../../../../Helpers/Utils.js");
       await getDoacao(event, strapi);
     },
   };
   ```

   Este código importa a função `getDoacao` do arquivo `Helpers/Utils.js` e a executa sempre que uma nova entrada é criada.
---
### Função `getDoacao`

A função `getDoacao` é usada para criar uma entrada na entidade `notificacao` no Strapi com base nos dados fornecidos pelo evento. Esta função gera uma mensagem personalizada e um título dependendo dos campos presentes na entrada de dados.

### Passos Detalhados da Função `getDoacao`

1. **Desestruturação dos Dados do Evento**:
   ```javascript
   const { ...newData } = event.result;
   ```
   Os dados do evento são desestruturados para serem utilizados na função.

2. **Inicialização das Variáveis**:
   ```javascript
   let titulo = "";
   let mensagem = "";
   ```
   Variáveis para armazenar o título e a mensagem da notificação são inicializadas.

3. **Log dos Dados Recebidos**:
   ```javascript
   console.log("newData => ", newData);
   console.log("event.params.sub_causas.connect => ", event.params.data.sub_causas.connect);
   ```
   Os dados recebidos são logados para verificação.

4. **Configuração do Título e Mensagem para Doação de Bens**:
   ```javascript
   if (newData.descricao) {
     titulo = "Doando Bens Site Fundação DRETU";
     mensagem = `O utente ${newData.nome ?? "desconhecido"}, cujo o email seja ${newData.email}, disponibilizou uma doação de: <br>
        ${newData.descricao} <br> para a fundação DRETU.`;
   }
   ```
   Se a doação for de bens, o título e a mensagem são configurados.

5. **Configuração do Título e Mensagem para Doação em Dinheiro**:
   ```javascript
   if (newData.montante) {
     titulo = "Transferência Online Site Fundação DRETU";
     mensagem = `O utente ${newData.nome ?? "desconhecido"}, cujo o email seja ${newData.email}, disponibilizou uma doação de ${newData.montante} para a fundação DRETU.`;
   }
   ```
   Se a doação for em dinheiro, o título e a mensagem são configurados.

6. **Configuração do Título e Mensagem para Doação de Tempo ou Talento**:
   ```javascript
   if (newData.sub_causas && newData.sub_causas.count > 0) {
     console.log("sub_causa =>", newData.sub_causas.count);

     const listSubCausaId = event.params.data.sub_causas.connect.map((x) => x.id);

     const causaName = await strapi.db.query(`api::sub-causa.sub-causa`).findMany({
       select: ["nome"],
       where: { id: { $in: listSubCausaId } },
     });

     let listEntryName = "";
     for (const listCausaName of causaName) {
       listEntryName += listCausaName.nome + "<br>";
     }

     console.log("causaId => ", listEntryName);

     titulo = "Doando Tempo ou Talento Site Fundação DRETU";
     mensagem = `O utente ${newData.nome ?? "desconhecido"}, cujo o email seja ${newData.email}, disponibilizou-se para agir nas seguintes causas: <br>
        ${listEntryName} <br> para a fundação DRETU.`;
   }
   ```
   Se a doação for de tempo ou talento, os nomes das sub-causas são concatenados e o título e a mensagem são configurados.

7. **Criação da Entrada na Entidade `notificacao`**:
   ```javascript
   const entry = await strapi.entityService.create(`api::notificacao.notificacao`, {
     data: {
       titulo: titulo,
       mensagem: mensagem,
       descricao: newData.descricao,
       email: newData.email,
       montante: newData.montante,
       nome: newData.nome,
       sub_causas: newData.sub_causas,
       telefone: newData.telefone,
     },
   });

   console.log("Entrada => ", entry);
   ```
   A entrada é criada na entidade `notificacao` com os dados configurados, e o resultado é logado.

---
