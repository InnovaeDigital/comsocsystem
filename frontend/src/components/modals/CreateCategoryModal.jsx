import { useState } from 'react';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { DEFAULT_CATEGORIES, getCategoryIcon } from '../../config/constants';

const DEFAULT_CATEGORY_KEYS = new Set(Object.keys(DEFAULT_CATEGORIES));
const CATEGORY_COLOR_OPTIONS = [
  { value: 'indigo', label: 'Azul Indico' },
  { value: 'purple', label: 'Roxo Purpura' },
  { value: 'cyan', label: 'Ciano Audiovisual' },
  { value: 'emerald', label: 'Verde Esmeralda' },
  { value: 'rose', label: 'Rosa Choque/Alerta' },
  { value: 'amber', label: 'Amarelo Dourado' },
];
const CATEGORY_ICON_OPTIONS = [
  { value: 'Palette', label: 'Paleta de Cores (Design)' },
  { value: 'Video', label: 'Camera de Video (Audiovisual)' },
  { value: 'Award', label: 'Medalha/Diploma (Cerimonial)' },
  { value: 'Shield', label: 'Escudo (Seguranca/Militar)' },
  { value: 'Calendar', label: 'Calendario (Planejamento)' },
  { value: 'MessageSquare', label: 'Balao de Chat (Comunicacao)' },
  { value: 'Users', label: 'Operadores (Relacoes)' },
];

function getColorThemeFromBg(bg = '') {
  return CATEGORY_COLOR_OPTIONS.find((option) => bg.includes(option.value))?.value || 'indigo';
}

export function CreateCategoryModal({ controller }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategoryKey, setEditingCategoryKey] = useState(null);
  const [editForm, setEditForm] = useState({ label: '', iconName: 'Palette', colorTheme: 'indigo' });
  const {
    categories,
    showCategoryModal,
    setShowCategoryModal,
    notify,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  } = controller;

  const categoryEntries = Object.entries(categories);

  return (
    <>
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl sm:rounded-[30px] p-5 sm:p-8 shadow-2xl my-4">
            <h2 className="text-md font-black text-white mb-6 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2 font-mono">
              <Plus className="text-amber-400" size={18} /> Adicionar Nova Categoria
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (isSubmitting) return;

                const form = e.target;
                const name = form.catName.value.trim();
                const icon = form.catIcon.value;
                const color = form.catColor.value;

                if (!name) return;

                setIsSubmitting(true);
                try {
                  const category = await handleCreateCategory({
                    label: name,
                    iconName: icon,
                    colorTheme: color,
                  });

                  if (category) {
                    form.reset();
                    notify('Nova categoria registrada no sistema!');
                  }
                } catch (error) {
                  console.error('Erro ao registrar categoria:', error);
                  notify(error.message || 'Nao foi possivel registrar a categoria.', 'error');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Nome da Categoria</label>
                <input name="catName" required placeholder="Ex: Imprensa, Relacoes Publicas, Web" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none text-xs text-white focus:ring-2 ring-blue-500 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Icone Representativo</label>
                <select name="catIcon" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none text-xs text-white focus:ring-2 ring-blue-500">
                  {CATEGORY_ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Cor Tematica</label>
                <select name="catColor" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none text-xs text-white focus:ring-2 ring-blue-500">
                  {CATEGORY_COLOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowCategoryModal(false)} disabled={isSubmitting} className="flex-1 p-4 rounded-xl font-bold text-xs text-slate-400 hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">Fechar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 p-4 rounded-xl font-bold text-xs text-white hover:bg-blue-550 transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categorias Cadastradas</h3>
                <span className="text-[10px] text-slate-500 font-bold">{categoryEntries.length} total</span>
              </div>

              <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
                {categoryEntries.map(([key, cat]) => {
                  const CatIcon = getCategoryIcon(cat.iconName);
                  const isDefault = DEFAULT_CATEGORY_KEYS.has(key);
                  const isEditing = editingCategoryKey === key;

                  return (
                    <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                      {isEditing ? (
                        <form
                          className="grid grid-cols-1 gap-2 flex-1"
                          onSubmit={async (event) => {
                            event.preventDefault();
                            if (isSubmitting || !editForm.label.trim()) return;

                            setIsSubmitting(true);
                            try {
                              await handleUpdateCategory(key, {
                                label: editForm.label.trim(),
                                iconName: editForm.iconName,
                                colorTheme: editForm.colorTheme,
                              });
                              setEditingCategoryKey(null);
                              notify('Categoria atualizada.');
                            } catch (error) {
                              console.error('Erro ao editar categoria:', error);
                            } finally {
                              setIsSubmitting(false);
                            }
                          }}
                        >
                          <input
                            value={editForm.label}
                            onChange={(event) => setEditForm((current) => ({ ...current, label: event.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg outline-none text-xs text-white focus:ring-1 ring-blue-500"
                            aria-label="Nome da categoria"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <select
                              value={editForm.iconName}
                              onChange={(event) => setEditForm((current) => ({ ...current, iconName: event.target.value }))}
                              className="bg-slate-900 border border-slate-800 p-2 rounded-lg outline-none text-xs text-white focus:ring-1 ring-blue-500"
                              aria-label="Icone da categoria"
                            >
                              {CATEGORY_ICON_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                            <select
                              value={editForm.colorTheme}
                              onChange={(event) => setEditForm((current) => ({ ...current, colorTheme: event.target.value }))}
                              className="bg-slate-900 border border-slate-800 p-2 rounded-lg outline-none text-xs text-white focus:ring-1 ring-blue-500"
                              aria-label="Cor da categoria"
                            >
                              {CATEGORY_COLOR_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCategoryKey(null)}
                              className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all flex items-center justify-center"
                              aria-label="Cancelar edicao"
                            >
                              <X size={14} />
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-8 h-8 rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center disabled:opacity-60"
                              aria-label="Salvar edicao"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                              <CatIcon size={16} className="text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{cat.label}</p>
                              <p className="text-[10px] text-slate-500 truncate">{key}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isDefault && (
                              <span className="text-[9px] uppercase font-black text-slate-500 border border-slate-800 rounded-lg px-2 py-1">
                                Padrao
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryKey(key);
                                setEditForm({
                                  label: cat.label || '',
                                  iconName: cat.iconName || 'Palette',
                                  colorTheme: getColorThemeFromBg(cat.bg),
                                });
                              }}
                              title={`Editar ${cat.label}`}
                              aria-label={`Editar categoria ${cat.label}`}
                              className="w-9 h-9 rounded-lg border border-blue-500/30 bg-blue-950/30 text-blue-300 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"
                            >
                              <Edit2 size={14} />
                            </button>
                            {!isDefault && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(key, cat.label)}
                                title={`Excluir ${cat.label}`}
                                aria-label={`Excluir categoria ${cat.label}`}
                                className="w-9 h-9 rounded-lg border border-red-500/30 bg-red-950/30 text-red-300 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
