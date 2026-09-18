import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, Users, ShieldCheck, UserCog, Search, Pencil, Power, KeyRound, Mail, AtSign } from 'lucide-react';
import { userRepository } from './services/userRepository';
import { beneficiaryRepository } from '../beneficiaries/services/beneficiaryRepository';
import { Modal, Toast } from '../../shared/components/Modal';
import { FeedbackCard } from '../../shared/components/FeedbackCard';
import { Button } from '../../shared/components/Button';
import { Input, Select } from '../../shared/components/Input';
import { BeneficiaryAutocomplete } from '../../shared/components/BeneficiaryAutocomplete';

const EMPTY = {
  id: null,
  version: 0,
  nombreCompleto: '',
  nombreUsuario: '',
  correo: '',
  clave: '',
  rol: 'OPERADOR',
  municipioAsignado: 'Apartadó',
  idBeneficiario: ''
};

const ROLE_META = {
  ADMIN: { label: 'Coordinador', className: 'role-badge-admin', description: 'Administra usuarios, roles y configuración sensible.' },
  OPERADOR: { label: 'Funcionario / Profesional', className: 'role-badge-operator', description: 'Gestiona casos únicamente en su municipio asignado.' },
  CONSULTA: { label: 'Beneficiario', className: 'role-badge-beneficiary', description: 'Accede únicamente a su ficha personal vinculada.' }
};

export function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formFeedback, setFormFeedback] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [userData, beneficiaryData] = await Promise.all([
        userRepository.getAll(),
        beneficiaryRepository.getAll()
      ]);
      setUsers(userData);
      setBeneficiaries(beneficiaryData.filter((b) => b.active !== false));
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'No fue posible cargar la administración de usuarios.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => [u.nombreCompleto, u.nombreUsuario, u.correo, ROLE_META[u.rol]?.label]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(q)));
  }, [users, query]);

  const openNew = () => {
    setForm(EMPTY);
    setErrors({});
    setFormFeedback(null);
    setIsModalOpen(true);
  };

  const openEdit = (user) => {
    setForm({
      id: user.id,
      version: user.version || 0,
      nombreCompleto: user.nombreCompleto || '',
      nombreUsuario: user.nombreUsuario || '',
      correo: user.correo || '',
      clave: '',
      rol: user.rol || 'OPERADOR',
      municipioAsignado: user.municipioAsignado || 'Apartadó',
      idBeneficiario: user.idBeneficiario ? String(user.idBeneficiario) : ''
    });
    setErrors({});
    setFormFeedback(null);
    setIsModalOpen(true);
  };

  const changeField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'rol') {
        if (value !== 'OPERADOR') next.municipioAsignado = '';
        if (value !== 'CONSULTA') next.idBeneficiario = '';
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormFeedback(null);
  };

  const validate = () => {
    const next = {};
    if (!form.nombreCompleto.trim()) next.nombreCompleto = 'Ingrese el nombre completo.';
    if (!/^[a-zA-Z0-9._-]{3,100}$/.test(form.nombreUsuario.trim())) next.nombreUsuario = 'Use 3 a 100 caracteres: letras, números, punto, guion o guion bajo.';
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) next.correo = 'Ingrese un correo válido.';
    if (!form.id && (!form.clave || form.clave.length < 12)) next.clave = 'La contraseña inicial debe tener mínimo 12 caracteres.';
    if (form.id && form.clave && form.clave.length < 12) next.clave = 'Si cambia la contraseña, debe tener mínimo 12 caracteres.';
    if (form.rol === 'OPERADOR' && !form.municipioAsignado) next.municipioAsignado = 'Seleccione el municipio asignado.';
    if (form.rol === 'CONSULTA' && !form.idBeneficiario) next.idBeneficiario = 'Debe vincular un beneficiario existente en la plataforma.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async (event) => {
    event?.preventDefault?.();
    if (!validate()) {
      setFormFeedback({ type: 'warning', text: 'Revise los campos marcados antes de guardar.' });
      return;
    }
    setSaving(true);
    setFormFeedback(null);
    try {
      const payload = {
        version: form.id ? form.version : undefined,
        nombreCompleto: form.nombreCompleto.trim(),
        nombreUsuario: form.nombreUsuario.trim(),
        correo: form.correo.trim() || null,
        clave: form.clave || null,
        rol: form.rol,
        municipioAsignado: form.rol === 'OPERADOR' ? form.municipioAsignado : null,
        idBeneficiario: form.rol === 'CONSULTA' ? Number(form.idBeneficiario) : null
      };
      if (!payload.clave) delete payload.clave;
      const saved = form.id
        ? await userRepository.update(form.id, payload)
        : await userRepository.create(payload);
      setUsers((prev) => form.id ? prev.map((u) => u.id === saved.id ? saved : u) : [saved, ...prev]);
      setIsModalOpen(false);
      setFeedback({ type: 'success', text: form.id ? 'Usuario y rol actualizados correctamente.' : 'Usuario creado y rol asignado correctamente.' });
    } catch (error) {
      setFormFeedback({ type: 'error', text: error.message || 'No fue posible guardar el usuario.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      const updated = await userRepository.changeStatus(user.id, user.version || 0, user.activo === false);
      setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
      setFeedback({ type: 'success', text: updated.activo ? 'Cuenta habilitada correctamente.' : 'Cuenta deshabilitada correctamente.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'No fue posible cambiar el estado de la cuenta.' });
    }
  };

  const counts = {
    total: users.length,
    coordinators: users.filter((u) => u.rol === 'ADMIN' && u.activo !== false).length,
    operators: users.filter((u) => u.rol === 'OPERADOR' && u.activo !== false).length,
    beneficiaries: users.filter((u) => u.rol === 'CONSULTA' && u.activo !== false).length
  };

  return (
    <div>
      <div className="users-heading-row">
        <div>
          <h2 className="page-section-title">Usuarios, roles y accesos</h2>
          <p className="page-section-subtitle">Solo Coordinación puede crear cuentas, asignar roles y vincular beneficiarios.</p>
        </div>
        <Button icon={UserPlus} onClick={openNew}>Crear usuario</Button>
      </div>

      <FeedbackCard
        type="info"
        title="Control de acceso"
        message="Los beneficiarios solo pueden iniciar sesión cuando su cuenta está vinculada a un beneficiario activo registrado en la plataforma. El acceso puede hacerse con correo o nombre de usuario y contraseña."
      />

      <div className="users-kpi-grid">
        <div className="users-kpi-card"><Users size={20}/><div><strong>{counts.total}</strong><span>Cuentas registradas</span></div></div>
        <div className="users-kpi-card"><ShieldCheck size={20}/><div><strong>{counts.coordinators}</strong><span>Coordinadores activos</span></div></div>
        <div className="users-kpi-card"><UserCog size={20}/><div><strong>{counts.operators}</strong><span>Funcionarios activos</span></div></div>
        <div className="users-kpi-card"><Users size={20}/><div><strong>{counts.beneficiaries}</strong><span>Beneficiarios con acceso</span></div></div>
      </div>

      <div className="users-panel">
        <div className="users-toolbar">
          <div className="users-search-wrap"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, usuario, correo o rol..." /></div>
          <span>{filtered.length} usuario(s)</span>
        </div>

        {loading ? (
          <div className="users-empty">Cargando usuarios...</div>
        ) : filtered.length === 0 ? (
          <div className="users-empty">No hay usuarios que coincidan con la búsqueda.</div>
        ) : (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead><tr><th>Usuario</th><th>Acceso</th><th>Rol</th><th>Ámbito / vínculo</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {filtered.map((user) => {
                  const meta = ROLE_META[user.rol] || ROLE_META.CONSULTA;
                  const linked = user.idBeneficiario ? beneficiaries.find((b) => String(b.id) === String(user.idBeneficiario)) : null;
                  return (
                    <tr key={user.id}>
                      <td><strong>{user.nombreCompleto}</strong><small>@{user.nombreUsuario}</small></td>
                      <td><span className="users-access-line"><Mail size={14}/>{user.correo || 'Sin correo'}</span><span className="users-access-line"><AtSign size={14}/>{user.nombreUsuario}</span></td>
                      <td><span className={`role-badge ${meta.className}`}>{meta.label}</span></td>
                      <td>{user.rol === 'OPERADOR' ? user.municipioAsignado : user.rol === 'CONSULTA' ? (linked?.fullName || `Beneficiario #${user.idBeneficiario || 'sin vínculo'}`) : 'Cobertura general'}</td>
                      <td><span className={`status-pill ${user.activo === false ? 'status-pill-off' : 'status-pill-on'}`}>{user.activo === false ? 'Inactivo' : 'Activo'}</span></td>
                      <td><div className="users-actions"><button onClick={() => openEdit(user)} title="Editar usuario"><Pencil size={16}/></button><button onClick={() => toggleStatus(user)} title={user.activo === false ? 'Habilitar cuenta' : 'Deshabilitar cuenta'}><Power size={16}/></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={form.id ? 'Editar usuario y rol' : 'Crear usuario y asignar rol'}
        size="lg"
        footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancelar</Button><Button onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar usuario'}</Button></>}
      >
        <form onSubmit={save}>
          {formFeedback && <FeedbackCard type={formFeedback.type} message={formFeedback.text} className="users-form-feedback" />}
          <div className="form-grid form-grid-2">
            <Input label="Nombre completo" name="nombreCompleto" value={form.nombreCompleto} onChange={changeField} error={errors.nombreCompleto} required />
            <Input label="Nombre de usuario" name="nombreUsuario" value={form.nombreUsuario} onChange={changeField} error={errors.nombreUsuario} icon={AtSign} required helperText="También puede usarse para iniciar sesión." />
            <Input label="Correo electrónico" name="correo" type="email" value={form.correo} onChange={changeField} error={errors.correo} icon={Mail} helperText="También puede usarse para iniciar sesión." />
            <Input label={form.id ? 'Nueva contraseña (opcional)' : 'Contraseña inicial'} name="clave" type="password" value={form.clave} onChange={changeField} error={errors.clave} icon={KeyRound} required={!form.id} helperText="Mínimo 12 caracteres." autoComplete="new-password" />
          </div>

          <Select
            label="Rol de acceso"
            name="rol"
            value={form.rol}
            onChange={changeField}
            required
            options={[
              { value: 'ADMIN', label: 'Coordinador' },
              { value: 'OPERADOR', label: 'Funcionario / Profesional' },
              { value: 'CONSULTA', label: 'Beneficiario' }
            ]}
            helperText={ROLE_META[form.rol]?.description}
          />

          {form.rol === 'OPERADOR' && (
            <Select label="Municipio asignado" name="municipioAsignado" value={form.municipioAsignado} onChange={changeField} error={errors.municipioAsignado} required options={['Apartadó', 'Turbo', 'Necoclí']} />
          )}

          {form.rol === 'CONSULTA' && (
            <>
              {errors.idBeneficiario && <FeedbackCard type="warning" message={errors.idBeneficiario} compact />}
              <BeneficiaryAutocomplete
                beneficiaries={beneficiaries}
                selectedId={form.idBeneficiario}
                onSelect={(beneficiary) => { setForm((prev) => ({ ...prev, idBeneficiario: beneficiary.id })); setErrors((prev) => ({ ...prev, idBeneficiario: '' })); }}
                onClear={() => setForm((prev) => ({ ...prev, idBeneficiario: '' }))}
                label="Beneficiario registrado que podrá acceder"
                required
                helperText="No se puede crear acceso de beneficiario sin un registro activo en la plataforma."
              />
            </>
          )}
        </form>
      </Modal>

      <Toast message={feedback} onClose={() => setFeedback(null)} />
    </div>
  );
}
