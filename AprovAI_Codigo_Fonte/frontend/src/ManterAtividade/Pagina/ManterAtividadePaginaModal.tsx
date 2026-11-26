
import React, { useEffect, useState } from 'react';
import { CalendarDays, FileText, X } from 'lucide-react';

import type {
  Atividade,
  EntradaFormularioAtividade,
} from '../../classes';

type ManterAtividadePaginaModalProps = {
  aberto: boolean;
  materiaId: string;
  atividade?: Atividade | null;
  salvando?: boolean;
  onFechar: () => void;
  onSalvar: (dados: EntradaFormularioAtividade) => Promise<void>;
};

const ManterAtividadePaginaModal = ({
  aberto,
  materiaId,
  atividade,
  salvando = false,
  onFechar,
  onSalvar,
}: ManterAtividadePaginaModalProps) => {
  const [conteudo, setConteudo] = useState('');
  const [prazo, setPrazo] = useState('');
  const [erro, setErro] = useState('');

  const editando = Boolean(atividade);

  useEffect(() => {
    if (!aberto) return;

    setConteudo(atividade?.conteudo ?? '');
    setPrazo(atividade?.prazo ?? '');
    setErro('');
  }, [aberto, atividade]);

  if (!aberto) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!conteudo.trim()) {
      setErro('Informe o conteúdo da atividade.');
      return;
    }

    setErro('');

    await onSalvar({
      materia_id: materiaId,
      conteudo: conteudo.trim(),
      prazo: prazo || '',
    });
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !salvando) {
          onFechar();
        }
      }}
    >
      <div
        className="modal"
        style={{
          maxWidth: 560,
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="modal-header">
          <div>
            <span className="modal-title">
              {editando ? 'Editar atividade' : 'Nova atividade'}
            </span>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {editando
                ? 'Atualize as informações desta atividade.'
                : 'Cadastre uma atividade para esta matéria.'}
            </p>
          </div>

          <button
            type="button"
            className="btn-icon"
            onClick={onFechar}
            disabled={salvando}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <div className="modal-body">
            <div className="form-group">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <FileText size={15} />
                Conteúdo da atividade
              </label>

              <textarea
                className="input"
                value={conteudo}
                onChange={(event) => setConteudo(event.target.value)}
                placeholder="Descreva o que os alunos deverão realizar..."
                rows={6}
                maxLength={10000}
                disabled={salvando}
                autoFocus
                style={{
                  resize: 'vertical',
                  minHeight: 130,
                }}
              />

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: 11,
                  textAlign: 'right',
                  marginTop: 4,
                }}
              >
                {conteudo.length}/10000 caracteres
              </p>
            </div>

            <div className="form-group">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <CalendarDays size={15} />
                Prazo de entrega
              </label>

              <input
                type="date"
                className="input"
                value={prazo}
                onChange={(event) => setPrazo(event.target.value)}
                disabled={salvando}
              />

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: 11,
                  marginTop: 5,
                }}
              >
                O prazo é opcional.
              </p>
            </div>

            {erro && (
              <p
                style={{
                  color: 'var(--danger)',
                  fontSize: 13,
                  marginTop: 8,
                }}
              >
                {erro}
              </p>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onFechar}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={salvando}
            >
              {salvando
                ? 'Salvando...'
                : editando
                  ? 'Salvar alterações'
                  : 'Cadastrar atividade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManterAtividadePaginaModal;
