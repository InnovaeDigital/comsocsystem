import { Plus, Users } from 'lucide-react';

export function AdminAccountsPanel({
  profile,
  users,
  notify,
  canManageUserAdmin,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleToggleUserAdmin,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.newUserName.value.trim();
    const role = form.newUserRole.value;
    if (!name) return;

    try {
      await handleCreateUser({ name, role });
      form.reset();
    } catch (error) {
      notify(error.message || 'Não foi possível criar a conta.', 'error');
    }
  };

  const handleEditUser = (member) => {
    const nextName = window.prompt('Novo nome do usuário:', member.name);
    if (!nextName || nextName.trim() === member.name) return;

    handleUpdateUser(member, { name: nextName.trim() }).catch((error) =>
      notify(error.message || 'Não foi possível editar a conta.', 'error'),
    );
  };

  const handleDelete = (member) => {
    if (!window.confirm(`Excluir a conta de ${member.name}?`)) return;

    handleDeleteUser(member).catch((error) =>
      notify(error.message || 'Não foi possível excluir a conta.', 'error'),
    );
  };

  return (
    <section className="bg-slate-900/70 border border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Users size={16} className="text-amber-400" /> Administração de Contas
          </h3>
          
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <input
            name="newUserName"
            required
            placeholder="Nome funcional"
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500 min-w-0 sm:min-w-56"
          />
          <select
            name="newUserRole"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={13} /> Criar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[9.75rem] md:max-h-[9.75rem] overflow-y-auto pr-1">
        {users.map((member) => {
          const grantedBy = users.find((candidate) => candidate.id === member.adminGrantedBy);
          const canToggle = canManageUserAdmin(member);
          const canDelete = !member.isOwner && member.id !== profile.id && (member.role !== 'admin' || canToggle);

          return (
            <div key={member.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="flex items-start gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-full flex shrink-0 items-center justify-center text-[10px] font-black text-white ${member.color || 'bg-slate-700'}`}>
                {member.name ? member.name.substring(0, 2).toUpperCase() : 'OP'}
              </div>
              <div className="min-w-0 flex-1 w-full pt-0.5">
                <p className="text-xs font-black text-white leading-snug break-words">{member.name}</p>
                <p className="text-[9px] text-slate-500 uppercase font-bold leading-tight mt-0.5">
                  {member.isOwner ? 'Admin principal' : member.role === 'admin' ? `Admin${grantedBy ? ` por ${grantedBy.name}` : ''}` : 'Usuário comum'}
                </p>
              </div>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5 w-full pt-1">
                <button
                  type="button"
                  onClick={() => handleEditUser(member)}
                  className="text-[9px] font-black px-2 py-1.5 rounded-lg border bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 cursor-pointer"
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={!canToggle}
                  onClick={() => handleToggleUserAdmin(member).catch((error) => notify(error.message || 'Não foi possível alterar a permissão.', 'error'))}
                  className={`text-[9px] font-black px-2 py-1.5 rounded-lg border transition-all ${
                    canToggle
                      ? member.role === 'admin'
                        ? 'bg-red-950/40 text-red-300 border-red-500/30 hover:bg-red-900/60 cursor-pointer'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/60 cursor-pointer'
                      : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                  }`}
                  title={!canToggle ? 'Esta permissão está protegida pela hierarquia de admins' : ''}
                >
                  {member.role === 'admin' ? 'Tirar admin' : 'Dar admin'}
                </button>
                <button
                  type="button"
                  disabled={!canDelete}
                  onClick={() => handleDelete(member)}
                  className={`text-[9px] font-black px-2 py-1.5 rounded-lg border transition-all ${
                    canDelete
                      ? 'bg-red-950/40 text-red-300 border-red-500/30 hover:bg-red-900/60 cursor-pointer'
                      : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                  }`}
                >
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
