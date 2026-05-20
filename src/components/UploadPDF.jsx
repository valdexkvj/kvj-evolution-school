import { useState } from 'react'
import { uploadPDF } from '../services/pdfService'

function UploadPDF({ onUploadSuccess }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
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

        const result = await uploadPDF(file, title, description)

        if (result.success) {
            setMessage('✅ PDF uploadé avec succès !')
            setTitle('')
            setDescription('')
            setFile(null)
            // Reset le champ file
            e.target.reset()

            // Notifier le parent pour recharger la liste
            if (onUploadSuccess) {
                onUploadSuccess()
            }
        } else {
            setMessage('❌ Erreur : ' + result.error)
        }

        setLoading(false)
    }

    return (
        <div style={styles.container}>
            <h2>📤 Uploader un PDF</h2>

            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="text"
                    placeholder="Titre du document"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                    disabled={loading}
                />

                <textarea
                    placeholder="Description (optionnel)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.textarea}
                    disabled={loading}
                />

                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={styles.input}
                    disabled={loading}
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
        marginBottom: '20px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
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
        padding: '10px',
        fontSize: '16px',
        backgroundColor: '#3ECF8E',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    message: {
        marginTop: '10px',
        fontWeight: 'bold'
    }
}

export default UploadPDF
