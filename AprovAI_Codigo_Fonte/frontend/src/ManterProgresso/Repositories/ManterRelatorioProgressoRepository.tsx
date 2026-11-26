import ManterRelatorioProgressoDAO from '../DAO/ManterRelatorioProgressoDAO';

import type {
  AlunoProgressoRelatorio,
  RelatorioProgresso,
} from '../Progresso/RelatorioProgresso';

const ManterRelatorioProgressoRepository = {
  async PesquisaRelatorioProgresso(
    professorId: string,
  ): Promise<RelatorioProgresso> {
    return ManterRelatorioProgressoDAO.PesquisaRelatorioProgresso(
      professorId,
    );
  },

  async PesquisaRelatorioProgressoAluno(
    alunoId: string,
  ): Promise<AlunoProgressoRelatorio> {
    return ManterRelatorioProgressoDAO.PesquisaRelatorioProgressoAluno(
      alunoId,
    );
  },
};

export default ManterRelatorioProgressoRepository;