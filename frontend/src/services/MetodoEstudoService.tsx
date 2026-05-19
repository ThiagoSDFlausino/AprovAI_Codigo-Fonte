import MetodoEstudoRepository from '../repositories/MetodoEstudoRepository';
import type { EntradaFormularioMetodoEstudo, FiltrosMetodoEstudo } from '../classes';

const MetodoEstudoService = {
  async PesquisaMetodoEstudo(filters: FiltrosMetodoEstudo = {}) {
    const { search, category } = filters;

    if (search && search.trim()) {
      return await MetodoEstudoRepository.PesquisaMetodoEstudoPorTexto(search.trim());
    }

    if (category && category !== 'all') {
      return await MetodoEstudoRepository.PesquisaMetodoEstudoPorCategoria(category);
    }

    return await MetodoEstudoRepository.PesquisaMetodoEstudo();
  },

  async PesquisaMetodoEstudoPorId(id: string) {
    return await MetodoEstudoRepository.PesquisaMetodoEstudoPorId(id);
  },

  async CadastroMetodoEstudo(methodData: EntradaFormularioMetodoEstudo, userId: string) {
    const { name, description, category, duration_minutes, benefits, ideal_for } = methodData;

    if (!name || !description || !category) {
      throw new Error('Nome, descrição e categoria são obrigatórios.');
    }

    return await MetodoEstudoRepository.CadastroMetodoEstudo({
      name,
      description,
      category,
      duration_minutes: duration_minutes || null,
      benefits: benefits || [],
      ideal_for: ideal_for || '',
      created_by: userId,
      created_at: new Date().toISOString(),
    });
  },

  async AtualizarMetodoEstudo(id: string, methodData: EntradaFormularioMetodoEstudo) {
    const { name, description, category, duration_minutes, benefits, ideal_for } = methodData;

    if (!name || !description || !category) {
      throw new Error('Nome, descrição e categoria são obrigatórios.');
    }

    return await MetodoEstudoRepository.AtualizarMetodoEstudo(id, {
      name,
      description,
      category,
      duration_minutes,
      benefits,
      ideal_for,
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
