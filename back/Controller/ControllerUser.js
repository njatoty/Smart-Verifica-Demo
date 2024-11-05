const User = require('../Models/User')

const allUser = async (req, res) => {

    try {

        var allUser = await User.find()
        res.status(200).json(allUser)

    } catch (error) {
        console.error("Erreur pour la liste des utilisateurs", error);
        res.status(500).json({message: 'Erreur du liste des utilisateurs'})
    }

}

const updateUser = async(req, res)=>{
    try {
        const {_id, name, email, role, firstname} = req.body

        const updatedUser = await User.findByIdAndUpdate(_id,
            {name, email, role, firstname}, {new: true}
        )

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Répondre avec l'utilisateur mis à jour
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Erreur pour la mise à jours des utilisateurs", error);
        res.status(500).json({message: 'Erreur du mis à jours des utilisateurs'})
    }
}

const deleteUser = async (req, res)=> {
    try {
        const { id } = req.params;

        // Vérifie si l'utilisateur existe
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Supprime l'utilisateur
        await User.findByIdAndDelete(id);

        // Répond avec un message de succès
        res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}
module.exports = {
    allUser, updateUser, deleteUser
}