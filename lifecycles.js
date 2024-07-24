module.exports = {
  async afterCreate(event){

    const { getDoacao } = require ( "../../../../Helpers/Utils.js");
    await getDoacao(event, strapi);
  },
};
