import fileService from "./fileService";

const API_BASE_URL = fileService.API_BASE_URL;
const token = () => localStorage.getItem('token');

const fetchAllUser = async () => {
    try {
        const allUser = await fetch(`${API_BASE_URL}/allUsers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token()}`,
            }
        })

        if (!allUser.ok) {
            throw new Error(`Erreur lors de la récupération des utilisateurs `);
        }

        const users = await allUser.json()
        return users

    } catch (error) {
        console.error(`Erreur lors de la récupération des utilisateurs: `, error);
        throw error
    }
}

const saveUser = async (data) => {
    
    const result = await fetch(`${API_BASE_URL}/registerUser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`,
        },
        body: JSON.stringify(data)
    })
    
    return result;
}

const updateUser = async(data) =>{
    const result = await fetch(`${API_BASE_URL}/updateUser`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`
        },
        body: JSON.stringify(data)
    })

    return result
}

const deleteUser = async(idUser)=>{
    const result = await fetch(`${API_BASE_URL}/deleteUser/${idUser}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`
        },
    })
    return result
}
const UserServices = {
    fetchAllUser, saveUser, updateUser, deleteUser
}

export default UserServices