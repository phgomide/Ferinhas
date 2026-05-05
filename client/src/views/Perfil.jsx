import { useState, useEffect, useRef } from 'react';

export default function Perfil({ session, editingUserId, navigateTo }) {
    const [formData, setFormData] = useState({
        name: '', labs: '', interests: '', github: '', linkedin: '', email: '', bio: '', question: '', existingImg: ''
    });
    const [imgPreview, setImgPreview] = useState('');
    const [feedback, setFeedback] = useState({ msg: '', type: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (editingUserId) loadProfile(editingUserId);
    }, [editingUserId]);

    const loadProfile = async (uid) => {
        try {
            const res = await fetch(`/api/profile/${uid}`);
            const data = res.ok ? await res.json() : {};

            setFormData({
                name: data.name || '',
                labs: data.labs || '',
                interests: data.interests || '',
                github: data.github || '',
                linkedin: data.linkedin || '',
                email: data.email || '',
                bio: data.bio || '',
                question: data.question || '',
                existingImg: data.img || ''
            });

            setImgPreview(data.img || '');
            setFeedback({ msg: '', type: '' });
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = ev => setImgPreview(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            setImgPreview(formData.existingImg);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setFeedback({ msg: 'Nome é obrigatório.', type: 'error' });
            return;
        }

        const payload = new FormData();
        Object.keys(formData).forEach(key => payload.append(key, formData[key]));

        if (fileInputRef.current?.files[0]) {
            payload.append('imgFile', fileInputRef.current.files[0]);
        }

        try {
            const res = await fetch(`/api/profile/${editingUserId}`, {
                method: 'POST',
                body: payload
            });

            if (res.ok) {
                const respData = await res.json();
                setFeedback({ msg: 'Perfil salvo com sucesso!', type: 'success' });
                if (respData.img) {
                    setFormData(prev => ({ ...prev, existingImg: respData.img }));
                    setImgPreview(respData.img);
                }
                setTimeout(() => setFeedback({ msg: '', type: '' }), 3000);
            } else {
                const errData = await res.json();
                setFeedback({ msg: errData.error || 'Erro ao salvar perfil.', type: 'error' });
            }
        } catch (err) {
            setFeedback({ msg: 'Erro de conexão.', type: 'error' });
        }
    };

    return (
        <div className="view active">
            <main>
                <div className="contact-wrap">
                    <p className="admin-title">{editingUserId === session.userId ? 'Meu Perfil' : `Editando Perfil #${editingUserId}`}</p>
                    <p className="apply-subtitle" style={{ marginBottom: '2rem' }}>// Edição de dados do Padrinho</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="apply-field">
                            <label className="apply-label">Nome de Exibição</label>
                            <input className="apply-input" name="name" type="text" placeholder="Seu nome" value={formData.name} onChange={handleInputChange} />
                        </div>

                        <div className="apply-field">
                            <label className="apply-label">Foto de Perfil (Máx 2MB)</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {imgPreview && (
                                    <img src={imgPreview} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                                )}
                                <input className="apply-input" type="file" accept="image/png, image/jpeg, image/webp" style={{ padding: '.5rem', flex: 1 }} ref={fileInputRef} onChange={handleFileChange} />
                            </div>
                        </div>

                        <div className="apply-field">
                            <label className="apply-label">Laboratórios / Grupos (vírgula)</label>
                            <input className="apply-input" name="labs" type="text" placeholder="Ex: ARIA, LAVID, QUASAR" value={formData.labs} onChange={handleInputChange} />
                        </div>
                        <div className="apply-field">
                            <label className="apply-label">Interesses (vírgula)</label>
                            <input className="apply-input" name="interests" type="text" placeholder="Ex: Games, Backend, Frontend" value={formData.interests} onChange={handleInputChange} />
                        </div>
                        <div className="apply-field">
                            <label className="apply-label">GitHub</label>
                            <input className="apply-input" name="github" type="text" placeholder="Nome de usuário ou URL" value={formData.github} onChange={handleInputChange} />
                        </div>
                        <div className="apply-field">
                            <label className="apply-label">LinkedIn</label>
                            <input className="apply-input" name="linkedin" type="text" placeholder="URL do perfil" value={formData.linkedin} onChange={handleInputChange} />
                        </div>
                        <div className="apply-field">
                            <label className="apply-label">E-mail de Contato</label>
                            <input className="apply-input" name="email" type="text" placeholder="e.g, rgscl@academico.ufpb.br" value={formData.email} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="apply-field" style={{ marginTop: '1.5rem' }}>
                        <label className="apply-label">Sobre mim</label>
                        <textarea className="apply-textarea" name="bio" placeholder="Conte um pouco sobre você..." value={formData.bio} onChange={handleInputChange}></textarea>
                    </div>
                    <div className="apply-field">
                        <label className="apply-label">O que o apadrinhamento representa para você?</label>
                        <textarea className="apply-textarea" name="question" placeholder="Sua visão sobre ser padrinho..." style={{ minHeight: '80px' }} value={formData.question} onChange={handleInputChange}></textarea>
                    </div>

                    <button className="btn-submit" style={{ marginTop: '1rem', width: 'auto', paddingLeft: '3rem', paddingRight: '3rem' }} onClick={handleSave}>
                        Salvar Alterações
                    </button>

                    {feedback.msg && <p className={`apply-feedback ${feedback.type}`}>{feedback.msg}</p>}
                </div>
            </main>
        </div>
    );
}