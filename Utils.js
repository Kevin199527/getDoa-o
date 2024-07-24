async function getDoacao(event, strapi) {
  const { ...newData } = event.result

  let titulo = ""
  let mensagem = "";

  // Log dos dados recebidos
  console.log("newData => ", newData)
  console.log("event.params.sub_causas.connect => ", event.params.data.sub_causas.connect)

  // Configuração do título e mensagem para doação de bens
  if (newData.descricao) {
    titulo = "Doando Bens Site Fundação DRETU";
    mensagem = `O utente ${newData.nome ?? "desconhecido"}, cujo o email seja ${newData.email}, disponibilizou uma doação de: <br>
       ${newData.descricao} <br> para a fundação DRETU.`;
  }

  // Configuração do título e mensagem para doação em dinheiro
  if (newData.montante) {
    titulo = "Transferência Online Site Fundação DRETU";
    mensagem = `O utente ${newData.nome ?? "desconhecido"}, cujo o email seja ${newData.email}, disponibilizou uma doação de ${newData.montante} para a fundação DRETU.`;
  }

  // Configuração do título e mensagem para doação de tempo ou talento
  if (newData.sub_causas && newData.sub_causas.count > 0) {
    console.log("sub_causa =>", newData.sub_causas.count)

    const listSubCausaId = event.params.data.sub_causas.connect.map(x => x.id)

    const causaName = await strapi.db.query(`api::sub-causa.sub-causa`).findMany({
      select: ['nome'],
      where: { id: { $in: listSubCausaId } },
    });

    let listEntryName = "";

    // Concatenação dos nomes das sub-causas
    for (const listCausaName of causaName) {
      listEntryName += listCausaName.nome + "<br>"
    }

    console.log("causaId => ", listEntryName)

    titulo = "Doando Tempo ou Talento Site Fundação DRETU";
    mensagem = `O utente ${newData.nome ?? "desconhecido"}, cujo o email seja ${newData.email}, disponibilizou-se para agir nas seguintes causas: <br>
       ${listEntryName} <br> para a fundação DRETU.`;
  }

  // Criação da entrada na entidade 'notificacao'
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
    }
  });

  console.log("Entrada => ", entry)
}

// Exportação do módulo
module.exports = {
  getDoacao
};
