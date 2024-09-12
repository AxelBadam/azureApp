import React, { useEffect, useState } from 'react';

function ImageDisplay() {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImageUrl = async () => {
            try {
                const response = await fetch('https://https://newfunc123.azurewebsites.net/api/testFunc123', { method: 'GET' });
                const data = await response.json();
                if (response.ok && data.imageUrl)
                    setImageUrl(data.imageUrl);
                else 
                    setError("No image available.");

            } 
            catch (err) {
                setError("Error loading image.");
            } 
            finally {
                setLoading(false);
            }
        };

        fetchImageUrl();
    }, []);

    if (loading)
        return <div>Loading...</div>;
    if (error)
        return <div>{error}</div>;
    return <img src={imageUrl} alt="Image from Cosmos DB" />;
}

export default ImageDisplay;