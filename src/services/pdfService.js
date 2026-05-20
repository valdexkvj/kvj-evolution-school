import { supabase } from '../supabase'

// =============================================
// UPLOADER UN PDF
// =============================================
export const uploadPDF = async (file, title, description) => {
    try {
        // 1. Créer un nom unique pour le fichier
        const fileName = `${Date.now()}-${file.name}`

        // 2. Uploader le fichier dans Storage
        const { error: uploadError } = await supabase.storage
            .from('pdfs')
            .upload(fileName, file)

        if (uploadError) {
            return { success: false, error: uploadError.message }
        }

        // 3. Récupérer l'URL publique
        const { data: urlData } = supabase.storage
            .from('pdfs')
            .getPublicUrl(fileName)

        const fileUrl = urlData.publicUrl

        // 4. Enregistrer dans la table documents
        const { data, error: insertError } = await supabase
            .from('documents')
            .insert([
                {
                    title,
                    description,
                    file_url: fileUrl
                }
            ])
            .select()

        if (insertError) {
            return { success: false, error: insertError.message }
        }

        return { success: true, data: data[0] }

    } catch (error) {
        return { success: false, error: error.message }
    }
}

// =============================================
// RÉCUPÉRER TOUS LES PDF
// =============================================
export const getAllPDF = async () => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data }

    } catch (error) {
        return { success: false, error: error.message }
    }
}

// =============================================
// SUPPRIMER UN PDF
// =============================================
export const deletePDF = async (id, fileUrl) => {
    try {
        // 1. Extraire le nom du fichier de l'URL
        const fileName = fileUrl.split('/').pop()

        // 2. Supprimer du Storage
        await supabase.storage.from('pdfs').remove([fileName])

        // 3. Supprimer de la table
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', id)

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true }

    } catch (error) {
        return { success: false, error: error.message }
    }
}
