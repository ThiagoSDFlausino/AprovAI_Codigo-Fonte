import ManterRelatorioProgressoRepository from '../Repositories/ManterRelatorioProgressoRepository';

import type { RelatorioProgresso } from '../Progresso/RelatorioProgresso';

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
};

export default ManterRelatorioProgressoService;