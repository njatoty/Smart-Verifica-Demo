import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import fileService from '../services/fileService';

const socket = io(fileService.API_BASE_URL);

const  InfoPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    // Fetch specific item info
    axios.get(fileService.API_BASE_URL+`/items/${id}`)
      .then(response => {setItem(response.data)})
      .catch(error => console.error('Error fetching item info:', error));

    // Déverrouiller l'élément lorsque l'utilisateur quitte la page
    return () => {
      socket.emit('unlock-item', id);
    };
  }, [id]);

  if (!item) return <div>Loading...</div>;

  return (
    <div>
      <h1>{item.name}</h1>
      <p>More information about {item.name}...</p>
    </div>
  );
}

export default InfoPage;
