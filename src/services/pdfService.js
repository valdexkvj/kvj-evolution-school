// src/services/pdfService.js
import { supabase } from '../supabase'

// Assure-toi d'utiliser le bon nom de bucket. 
// Dans ton code tu utilisais 'pdfs', on va le garder.
const BUCKET_NAME = 'pdfs'

// =============================================
// UPLOADER UN COURS (PDF)
// =============================================
export const uploadCourse = async (file, title, enonce, niveau, category) => {
    try {
        // 1. (Optionnel) Vérifier que l'utilisateur est connecté pour la sécurité RLS
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return { success: false, error: "Vous devez être connecté." }

        // 2. Créer un nom unique (en nettoyant les espaces et accents)
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
        const fileName = `${Date.now()}-${cleanFileName}`

        // 3. Uploader le fichier dans Storage
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file)

        if (uploadError) return { success: false, error: uploadError.message }

        // 4. Récupérer l'URL publique
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName)

        const fileUrl = urlData.publicUrl

        // 5. Enregistrer dans la table 'courses' (qui remplace 'documents')
        const { data, error: insertError } = await supabase
            .from('courses')
            .insert([
                {
                    title,
                    enonce, // équivalent de ta description
                    niveau, // L1, L2, ou L3
                    category,
                    pdf_url: fileUrl // Correspond à ton SQL
                }
            ])
            .select()

        if (insertError) return { success: false, error: insertError.message }

        return { success: true, data: data[0] }

    } catch (error) {
        return { success: false, error: error.message }
    }
}

// =============================================
// RÉCUPÉRER TOUS LES COURS
// =============================================
export const getAllCourses = async () => {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) return { success: false, error: error.message }

        return { success: true, data }

    } catch (error) {
        return { success: false, error: error.message }
    }
}

// =============================================
// SUPPRIMER UN COURS
// =============================================
export const deleteCourse = async (id, pdfUrl) => {
    try {
        // 1. Extraire le nom du fichier de l'URL s'il y a un PDF
        if (pdfUrl) {
            const fileName = pdfUrl.split('/').pop()
            await supabase.storage.from(BUCKET_NAME).remove([fileName])
        }

        // 2. Supprimer de la table courses
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', id)

        if (error) return { success: false, error: error.message }

        return { success: true }

    } catch (error) {
        return { success: false, error: error.message }
    }
}