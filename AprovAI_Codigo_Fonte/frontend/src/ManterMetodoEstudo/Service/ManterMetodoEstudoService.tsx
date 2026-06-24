import MetodoEstudoRepository from '../Repositories/ManterMetodoEstudoRepository';
import type { EntradaFormularioMetodoEstudo, FiltrosMetodoEstudo } from '../../classes';

const MetodoEstudoService = {
  async PesquisaMetodoEstudo(filters: FiltrosMetodoEstudo = {}) {
    const { busca, categoria } = filters;

    if (busca && busca.trim()) {
      return await MetodoEstudoRepository.PesquisaMetodoEstudoPorTexto(busca.trim());
    }

    if (categoria && categoria !== 'all') {
      return await MetodoEstudoRepository.PesquisaMetodoEstudoPorCategoria(categoria);
    }

    return await MetodoEstudoRepository.PesquisaMetodoEstudo();
  },

  async PesquisaMetodoEstudoPorId(id: string) {
    return await MetodoEstudoRepository.PesquisaMetodoEstudoPorId(id);
  },

  async CadastroMetodoEstudo(methodData: EntradaFormularioMetodoEstudo, userId: string) {
    const { nome, descricao, categoria, duracao, beneficios, ideal_para } = methodData;

    if (!nome || !descricao || !categoria) {
      throw new Error('Nome, descrição e categoria são obrigatórios.');
    }

    return await MetodoEstudoRepository.CadastroMetodoEstudo({
      nome,
      descricao,
      categoria,
      duracao: duracao || null,
      beneficios: beneficios || [],
      ideal_para: ideal_para || '',
      criado_por: userId,
      criado_em: new Date().toISOString(),
    });
  },

  async AtualizarMetodoEstudo(id: string, methodData: EntradaFormularioMetodoEstudo) {
    const { nome, descricao, categoria, duracao, beneficios, ideal_para } = methodData;

    if (!nome || !descricao || !categoria) {
      throw new Error('Nome, descrição e categoria são obrigatórios.');
    }

    return await MetodoEstudoRepository.AtualizarMetodoEstudo(id, {
      nome,
      descricao,
      categoria,
      duracao,
      beneficios,
      ideal_para,
    });
  },

  async DeletarMetodoEstudo(id: string) {
    return await MetodoEstudoRepository.DeletarMetodoEstudo(id);
  },

  getCategories() {
    return [
      { value: 'all', label: 'Todas as categorias' },
      { value: 'focus', label: 'Técnica de Foco' },
      { value: 'organization', label: 'Organização' },
      { value: 'revision', label: 'Revisão' },
      { value: 'memorization', label: 'Memorização' },
      { value: 'reading', label: 'Leitura' },
      { value: 'practice', label: 'Prática' },
    ];
  },

  getCategoryLabel(value: string) {
    const cats = this.getCategories();
    return cats.find((c) => c.value === value)?.label || value;
  },
};

export default MetodoEstudoService;
