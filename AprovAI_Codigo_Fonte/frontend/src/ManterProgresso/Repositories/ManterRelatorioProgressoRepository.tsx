import ManterRelatorioProgressoDAO from '../DAO/ManterRelatorioProgressoDAO';

import type { RelatorioProgresso } from '../Progresso/RelatorioProgresso';

const ManterRelatorioProgressoRepository = {
  async PesquisaRelatorioProgresso(
    professorId: string,
  ): Promise<RelatorioProgresso> {
    return ManterRelatorioProgressoDAO.PesquisaRelatorioProgresso(
      professorId,
    );
  },
};

export default ManterRelatorioProgressoRepository;