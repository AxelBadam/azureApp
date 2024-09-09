const { app } = require('@azure/functions');
const contentful = require('contentful');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    environment: 'master',
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

const cosmosClient = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const database = cosmosClient.database('azure-db');
const container = database.container('azure-db');

app.http('httpTrigger', {
    methods: ['POST', 'GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method === 'POST') {
            let body;
            try {
                body = await request.text();
            } 
            catch (error) {
                return { status: 400, body: 'Unable to read request body.' };
            }

            let payload;
            try {
                payload = JSON.parse(body);
            } 
            catch (error) {
                return { status: 400, body: 'Invalid JSON format in request body.' };
            }

            if (!payload || !payload.fields || !payload.fields.file) {
                return { status: 400, body: 'Missing required fields in request body.' };
            }

            const imageUrl = `https:${payload.fields.file['en-US'].url}`;
            context.log(`Received Image URL: ${imageUrl}`);

            // Save the image URL to Cosmos DB
            const newImage = {
                id: 'latestImage',
                url: imageUrl,
                timestamp: new Date().toISOString()
            };

            try {
                await container.items.upsert(newImage);  // insert or replace the document
                return { status: 200, body: JSON.stringify({ message: 'Image URL stored successfully.' }) };
            } 
            catch (error) {
                context.log('Error storing image URL:', error);
                return { status: 500, body: 'Error storing image URL in the database.' };
            }
        }

        // Retrieve the latest image URL
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