import ManterRelatorioProgressoRepository from '../Repositories/ManterRelatorioProgressoRepository';

import type {
  AlunoProgressoRelatorio,
  RelatorioProgresso,
} from '../Progresso/RelatorioProgresso';

const ManterRelatorioProgressoService = {
  async PesquisaRelatorioProgresso(
    professorId: string,
  ): Promise<RelatorioProgresso> {
    if (!professorId || !professorId.trim()) {
      throw new Error('Professor não identificado.');
    }

    return ManterRelatorioProgressoRepository.PesquisaRelatorioProgresso(
      professorId,
    );
  },

  async PesquisaRelatorioProgressoAluno(
    alunoId: string,
  ): Promise<AlunoProgressoRelatorio> {
    if (!alunoId || !alunoId.trim()) {
      throw new Error('Aluno não identificado.');
    }

    return ManterRelatorioProgressoRepository.PesquisaRelatorioProgressoAluno(
      alunoId,
    );
  },
};

export default ManterRelatorioProgressoService;