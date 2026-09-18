import React, { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, CalendarDays, MapPin, Users, Save, RefreshCw } from 'lucide-react';
import { apiAdapter } from '../../core/adapters/apiAdapter';
import { eventRepository } from './services/eventRepository';

const emptyForm = {
  idPrograma: '', nombre: '', descripcion: '', fechaInicio: '', fechaFin: '', lugar: '', cupo: ''
};

export function EventManagementView() {
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const programMap = useMemo(() => Object.fromEntries(programs.map(p => [String(p.id), p.name])), [programs]);

  const load = async () => {
    setLoading(true);
    try {
      const [p, e] = await Promise.all([apiAdapter.getProgramas(), eventRepository.list(null, false)]);
      setPrograms(p || []);
      setEvents(e || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'No fue posible cargar los eventos.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (ev) => {
    ev.preventDefault();
    if (!form.idPrograma || !form.nombre || !form.fechaInicio || !form.fechaFin || !form.lugar) {
      setMessage({ type: 'error', text: 'Programa, nombre, fechas y lugar son obligatorios.' });
      return;
    }
    setSaving(true);
    try {
      await eventRepository.create({
        idPrograma: Number(form.idPrograma),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        lugar: form.lugar.trim(),
        cupo: form.cupo === '' ? null : Number(form.cupo)
      });
      setForm(emptyForm);
      setMessage({ type: 'success', text: 'Evento creado y guardado correctamente en la base de datos.' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'No fue posible crear el evento.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ margin: 0, color: '#063630' }}>Eventos y actividades</h2>
        <p style={{ color: '#5B6F6A', marginTop: '.35rem' }}>
          Crea actividades asociadas a un programa. Cuando un beneficiario se postula al programa, queda inscrito automáticamente en sus eventos activos y vigentes.
        </p>
      </div>

      {message && (
        <div style={{ padding: '.85rem 1rem', borderRadius: 12, background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2', color: message.type === 'success' ? '#065F46' : '#991B1B', border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}` }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, .9fr) minmax(520px, 1.5fr)', gap: '1.25rem', alignItems: 'start' }}>
        <form onSubmit={submit} style={{ background: '#fff', border: '1px solid #DDE8E5', borderRadius: 16, padding: '1.25rem', boxShadow: '0 4px 18px rgba(6,54,48,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' }}>
            <CalendarPlus size={22} color="#0D7C70" />
            <strong style={{ color: '#063630', fontSize: '1.05rem' }}>Crear nuevo evento</strong>
          </div>

          <label style={labelStyle}>Programa asociado</label>
          <select value={form.idPrograma} onChange={e => setForm({ ...form, idPrograma: e.target.value })} style={inputStyle}>
            <option value="">Seleccione un programa</option>
            {programs.filter(p => p.active !== false).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <label style={labelStyle}>Nombre del evento</label>
          <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} style={inputStyle} placeholder="Ej. Taller de emprendimiento" />

          <label style={labelStyle}>Descripción</label>
          <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} placeholder="Objetivo y detalles de la actividad" />

          <label style={labelStyle}>Fecha y hora de inicio</label>
          <input type="datetime-local" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })} style={inputStyle} />

          <label style={labelStyle}>Fecha y hora de finalización</label>
          <input type="datetime-local" value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })} style={inputStyle} />

          <label style={labelStyle}>Lugar</label>
          <input value={form.lugar} onChange={e => setForm({ ...form, lugar: e.target.value })} style={inputStyle} placeholder="Ej. Casa de la Cultura, Apartadó" />

          <label style={labelStyle}>Cupo máximo (opcional)</label>
          <input type="number" min="0" value={form.cupo} onChange={e => setForm({ ...form, cupo: e.target.value })} style={inputStyle} placeholder="Sin límite" />

          <button type="submit" disabled={saving} style={{ width: '100%', border: 0, borderRadius: 11, padding: '.8rem 1rem', background: '#0D7C70', color: '#fff', fontWeight: 800, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
            <Save size={17} /> {saving ? 'Guardando...' : 'Guardar evento'}
          </button>
        </form>

        <section style={{ background: '#fff', border: '1px solid #DDE8E5', borderRadius: 16, padding: '1.25rem', boxShadow: '0 4px 18px rgba(6,54,48,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}><CalendarDays size={22} color="#0D7C70" /><strong style={{ color: '#063630', fontSize: '1.05rem' }}>Eventos registrados</strong></div>
            <button onClick={load} style={{ border: '1px solid #CFE0DC', background: '#F7FBFA', borderRadius: 9, padding: '.5rem .7rem', cursor: 'pointer', color: '#0D5C54' }}><RefreshCw size={16} /></button>
          </div>

          {loading ? <p>Cargando eventos...</p> : events.length === 0 ? <p style={{ color: '#6B7C78' }}>Aún no hay eventos creados.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
              {events.map(evt => (
                <article key={evt.id} style={{ border: '1px solid #E0EBE8', borderRadius: 13, padding: '1rem', background: evt.activo === false ? '#F8FAF9' : '#FCFEFD' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#063630' }}>{evt.nombre}</div>
                      <div style={{ fontSize: '.82rem', color: '#0D7C70', marginTop: '.2rem' }}>{programMap[String(evt.idPrograma)] || `Programa #${evt.idPrograma}`}</div>
                    </div>
                    <span style={{ fontSize: '.75rem', fontWeight: 700, background: evt.activo === false ? '#E5E7EB' : '#D1FAE5', color: evt.activo === false ? '#4B5563' : '#065F46', padding: '.25rem .55rem', borderRadius: 999 }}>{evt.activo === false ? 'Inactivo' : 'Activo'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem', marginTop: '.8rem', fontSize: '.82rem', color: '#51635F' }}>
                    <div><CalendarDays size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{String(evt.fechaInicio || '').replace('T', ' ')}</div>
                    <div><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{evt.lugar}</div>
                    <div><Users size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{evt.inscritos || 0}{evt.cupo != null ? ` / ${evt.cupo}` : ''} inscritos</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#36534D', marginBottom: '.35rem', marginTop: '.8rem' };
const inputStyle = { width: '100%', boxSizing: 'border-box', border: '1px solid #CFE0DC', borderRadius: 10, padding: '.7rem .75rem', background: '#fff', color: '#173F38', outline: 'none' };
