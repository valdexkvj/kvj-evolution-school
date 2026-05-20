// src/components/UploadPDF.jsx
import { useState } from 'react'
import { uploadCourse } from '../services/pdfService'

function UploadPDF({ onUploadSuccess }) {
    const [title, setTitle] = useState('')
    const [enonce, setEnonce] = useState('') // Remplace description
    const [niveau, setNiveau] = useState('L1') // Nouveau champ de ton SQL
    const [category, setCategory] = useState('Cours') // Nouveau champ
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!file) {
            setMessage('❌ Veuillez choisir un fichier PDF')
            return
        }

        if (!title.trim()) {
            setMessage('❌ Le titre est obligatoire')
            return
        }

        setLoading(true)
        setMessage('⏳ Upload en cours...')

        // Appel du service avec les nouveaux paramètres
        const result = await uploadCourse(file, title, enonce, niveau, category)

        if (result.success) {
            setMessage('✅ Cours uploadé avec succès !')
            // Réinitialisation
            setTitle('')
            setEnonce('')
            setNiveau('L1')
            setCategory('Cours')
            setFile(null)
            e.target.reset()

            if (onUploadSuccess) onUploadSuccess()
        } else {
            setMessage('❌ Erreur : ' + result.error)
        }

        setLoading(false)
    }

    return (
        <div style={styles.container}>
            <h2>📤 Uploader un Cours</h2>

            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="text"
                    placeholder="Titre du cours"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                    disabled={loading}
                    required
                />

                <div style={styles.row}>
                    <select 
                        value={niveau} 
                        onChange={(e) => setNiveau(e.target.value)} 
                        style={styles.select}
                        disabled={loading}
                    >
                        <option value="L1">L1</option>
                        <option value="L2">L2</option>
                        <option value="L3">L3</option>
                    </select>

                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        style={styles.select}
                        disabled={loading}
                    >
                        <option value="Cours">Cours</option>
                        <option value="TD">TD</option>
                        <option value="TP">TP</option>
                        <option value="Examens">Examens</option>
                    </select>
                </div>

                <textarea
                    placeholder="Énoncé / Description (optionnel)"
                    value={enonce}
                    onChange={(e) => setEnonce(e.target.value)}
                    style={styles.textarea}
                    disabled={loading}
                />

                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={styles.input}
                    disabled={loading}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={styles.button}
                >
                    {loading ? 'Upload en cours...' : 'Uploader'}
                </button>
            </form>

            {message && <p style={styles.message}>{message}</p>}
        </div>
    )
}

const styles = {
    container: {
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        marginBottom: '20px',
        backgroundColor: '#fff'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '15px'
    },
    row: {
        display: 'flex',
        gap: '10px'
    },
    select: {
        flex: 1,
        padding: '10px',
        fontSize: '14px',
        borderRadius: '4px',
        border: '1px solid #ccc'
    },
    input: {
        padding: '10px',
        fontSize: '14px',
        borderRadius: '4px',
        border: '1px solid #ccc'
    },
    textarea: {
        padding: '10px',
        fontSize: '14px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        minHeight: '80px'
    },
    button: {
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#3ECF8E', // Vert Supabase !
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    message: {
        marginTop: '15px',
        fontWeight: 'bold',
        textAlign: 'center'
    }
}

export default UploadPDF