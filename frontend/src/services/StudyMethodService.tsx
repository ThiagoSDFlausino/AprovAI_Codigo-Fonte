// src/services/StudyMethodService.js
import StudyMethodRepository from '../repositories/StudyMethodRepository';

type MethodListFilters = { search?: string; category?: string };

const StudyMethodService = {
  async PesquisaMetodoEstudo(filters: MethodListFilters = {}) {
    const { search, category } = filters;

    if (search && search.trim()) {
      return await StudyMethodRepository.PesquisaMetodoEstudoPorTexto(search.trim());
    }

    if (category && category !== 'all') {
      return await StudyMethodRepository.PesquisaMetodoEstudoPorCategoria(category);
    }

    return await StudyMethodRepository.PesquisaMetodoEstudo();
  },

  async PesquisaMetodoEstudoPorId(id) {
    return await StudyMethodRepository.PesquisaMetodoEstudoPorId(id);
  },

  async CadastroMetodoEstudo(methodData, userId) {
    const { name, description, category, duration_minutes, benefits, ideal_for } = methodData;

    if (!name || !description || !category) {
      throw new Error('Nome, descrição e categoria são obrigatórios.');
    }

    return await StudyMethodRepository.CadastroMetodoEstudo({
      name,
      description,
      category,
      duration_minutes: duration_minutes || null,
      benefits: benefits || [],
      ideal_for: ideal_for || '',
      created_by: userId,
      created_at: new Date().toISOString()
    });
  },

  async AtualizarMetodoEstudo(id, methodData) {
    const { name, description, category, duration_minutes, benefits, ideal_for } = methodData;

    if (!name || !description || !category) {
      throw new Error('Nome, descrição e categoria são obrigatórios.');
    }

    return await StudyMethodRepository.AtualizarMetodoEstudo(id, {
      name,
      description,
      category,
      duration_minutes,
      benefits,
      ideal_for
    });
  },

  async DeletarMetodoEstudo(id) {
    return await StudyMethodRepository.DeletarMetodoEstudo(id);
  },

  getCategories() {
    return [
      { value: 'all', label: 'Todas as categorias' },
      { value: 'focus', label: 'Técnica de Foco' },
      { value: 'organization', label: 'Organização' },
      { value: 'revision', label: 'Revisão' },
      { value: 'memorization', label: 'Memorização' },
      { value: 'reading', label: 'Leitura' },
      { value: 'practice', label: 'Prática' }
    ];
  },

  getCategoryLabel(value) {
    const cats = this.getCategories();
    return cats.find(c => c.value === value)?.label || value;
  }
};

export default StudyMethodService;
