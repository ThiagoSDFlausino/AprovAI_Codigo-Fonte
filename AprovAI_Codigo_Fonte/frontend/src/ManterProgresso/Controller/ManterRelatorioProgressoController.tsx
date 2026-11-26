import ManterRelatorioProgressoService from '../Service/ManterRelatorioProgressoService';

import type { RelatorioProgresso } from '../Progresso/RelatorioProgresso';

const ManterRelatorioProgressoController = {
  async PesquisaRelatorioProgresso(
    professorId: string,
  ): Promise<RelatorioProgresso> {
    try {
      return await ManterRelatorioProgressoService.PesquisaRelatorioProgresso(
        professorId,
      );
    } catch (error) {
      console.error('Erro ao consultar relatório de progresso:', error);
      throw error;
    }
  },
};

export default ManterRelatorioProgressoController;