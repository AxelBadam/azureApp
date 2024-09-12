import React, { useEffect, useState } from 'react';
import './ImageDisplay.css';

function ImageDisplay() {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImageUrl = async () => {
            try {
                const response = await fetch('https://newfunc123.azurewebsites.net/api/httpTrigger', { method: 'GET' });
                const data = await response.json();
                if (response.ok && data.imageUrl)
                    setImageUrl(data.imageUrl);
                else 
                    setError("No image available.");
                // const localImage = "Mannerheim1940.jpg"; // Path to your local image in the 'public' folder
                // setImageUrl(localImage);

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
    return (
    <div className="image-container">
        <img src={imageUrl} alt="Responsive" className="responsive-image" />
    </div>
    );
    // return <img src={imageUrl} alt="Cosmos DB render" />;
}

export default ImageDisplay;