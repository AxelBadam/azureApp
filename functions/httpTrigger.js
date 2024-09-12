const { CosmosClient } = require('@azure/cosmos');
const { app } = require('@azure/functions');
require('dotenv').config();


const connectionString = process.env.CUSTOMCONNSTR_COSMOS_CONNECTION_STRING;

if (!connectionString) {
    throw new Error("Cosmos DB connection string is not defined in environment variables.");
}

// Use the CosmosClient with the connection string
const cosmosClient = new CosmosClient(connectionString);
let database;
let container;

try {
    database = cosmosClient.database('azure-db');
    container = database.container('azure-db');
    // Perform operations on the database and container here
} catch (error) {
    console.error('Error connecting to Cosmos DB or container:', error);
    throw new Error("Cosmos DB operation failed."); // Optional: Better error handling
}

app.http('httpTrigger', {
    methods: ['POST', 'GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'POST') {
            let body;
            try {
                body = await request.text();
            } catch (error) {
                context.log('Error reading request body:', error);
                return { status: 400, body: 'Unable to read request body.' };
            }
            let payload;
            try {
                payload = JSON.parse(body);
            } catch (error) {
                context.log('Invalid JSON format:', error);
                return { status: 400, body: 'Invalid JSON format in request body.' };
            }
            if (!payload || !payload.fields || !payload.fields.file) {
                return { status: 400, body: 'Missing required fields in request body.' };
            }
            const imageUrl = `https:${payload.fields.file['en-US'].url}`;
            context.log(`Received Image URL: ${imageUrl}`);

            const newImage = {
                id: 'latestImage',
                url: imageUrl,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await container.items.upsert(newImage);  // Insert or replace the document
                context.log('Upsert response:', response);
                return { status: 200, body: JSON.stringify({ message: 'Image URL stored successfully.' }) };
            } catch (error) {
                context.log('Error storing image URL:', error);
                return { status: 500, body: 'Error storing image URL in the database.' };
            }
        }
        if (request.method === 'GET') {
            try {
                const { resource } = await container.item('latestImage').read();
                if (!resource || !resource.url) {
                    return { status: 404, body: 'No image available.' };
                }
                return { status: 200, body: JSON.stringify({ imageUrl: resource.url }) };
            } catch (error) {
                context.log('Error fetching image URL:', error);
                return { status: 500, body: 'Error retrieving image URL from the database.' };
            }
        }
        return { status: 405, body: 'This endpoint only supports POST and GET requests.' };
    }
});