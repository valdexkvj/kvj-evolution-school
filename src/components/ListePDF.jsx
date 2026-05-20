import { useState, useEffect } from 'react'
import { getAllPDF, deletePDF } from '../services/pdfService'

function ListePDF({ refresh }) {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)

    // Charger les PDF
    const loadDocuments = async () => {
        setLoading(true)
        const result = await getAllPDF()
        if (result.success) {
            setDocuments(result.data)
        }
        setLoading(false)
    }

    // Charger au démarrage et quand refresh change
    useEffect(() => {
        loadDocuments()
    }, [refresh])

    // Supprimer un PDF
    const handleDelete = async (id, fileUrl) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce PDF ?')) return

        const result = await deletePDF(id, fileUrl)
        if (result.success) {
            loadDocuments() // Recharger la liste
        } else {
            alert('Erreur : ' + result.error)
        }
    }

    if (loading) {
        return <p>⏳ Chargement...</p>
    }

    if (documents.length === 0) {
        return <p>📭 Aucun PDF disponible pour le moment</p>
    }

    return (
        <div style={styles.container}>
            <h2>📚 Documents disponibles ({documents.length})</h2>

            <div style={styles.list}>
                {documents.map((doc) => (
                    <div key={doc.id} style={styles.card}>
                        <h3 style={styles.title}>{doc.title}</h3>

                        {doc.description && (
                            <p style={styles.description}>{doc.description}</p>
                        )}

                        <p style={styles.date}>
                            Ajouté le : {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                        </p>

                        <div style={styles.actions}>
                            <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.link}
                            >
                                📄 Voir / Télécharger
                            </a>

                            <button
                                onClick={() => handleDelete(doc.id, doc.file_url)}
                                style={styles.deleteBtn}
                            >
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const styles = {
    container: {
        padding: '20px'
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '15px'
    },
    card: {
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
    },
    title: {
        margin: '0 0 10px 0',
        color: '#333'
    },
    description: {
        color: '#666',
        fontSize: '14px'
    },
    date: {
        color: '#999',
        fontSize: '12px'
    },
    actions: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px'
    },
    link: {
        padding: '8px 12px',
        backgroundColor: '#3ECF8E',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '14px'
    },
    deleteBtn: {
        padding: '8px 12px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    }
}

export default ListePDF
