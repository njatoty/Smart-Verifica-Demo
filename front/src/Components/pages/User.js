import React, { useEffect, useState } from 'react';
import AllUsers from '../others/dropdown-menu/AllUser';
import UserServices from '../services/serviceUser';


// Hook pour gérer les utilisteurs (Single Responsibility)

const User=()=> {

    const [users, setUsers] = useState([])
    
    // Fonction pour récupérer les données des utilisateurs
    const fetchData =  () => {
        UserServices.fetchAllUser()
            .then(data=>{
                setUsers(data)
            })
            .catch(error=>console.error("Erreur lors de la récupération des users", error))
    };

    useEffect (()=>{
        fetchData()
    }, [])

    const handleUpdate =async (user) =>{
        // var user = JSON.parse(JSON.stringify(user))
        const response = await UserServices.updateUser(user)        
        if (response.ok) {
            fetchData()   
        }
        return response
    }

    const handleDelete = async (userId) =>{
        const response = await UserServices.deleteUser(userId)  
        if (response.ok) {
            fetchData()   
            // setUsers(users.filter(user => user._id !== userId)) 
        }
        return response
    }

    return (
        <div className="flex flex-col items-start h-full w-full flex-grow">
            <div className='w-full overflow-x-auto h-full'>
                <AllUsers data={users} onUpdate={handleUpdate} onDelete={handleDelete}/>
            </div>
        </div>
    );
}

export default User;