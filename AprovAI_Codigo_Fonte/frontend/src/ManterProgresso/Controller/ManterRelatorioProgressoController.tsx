import ManterRelatorioProgressoService from '../Service/ManterRelatorioProgressoService';

import type {
  AlunoProgressoRelatorio,
  RelatorioProgresso,
} from '../Progresso/RelatorioProgresso';

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

  async PesquisaRelatorioProgressoAluno(
    alunoId: string,
  ): Promise<AlunoProgressoRelatorio> {
    try {
      return await ManterRelatorioProgressoService.PesquisaRelatorioProgressoAluno(
        alunoId,
      );
    } catch (error) {
      console.error('Erro ao consultar progresso do aluno:', error);
      throw error;
    }
  },
};

export default ManterRelatorioProgressoController;