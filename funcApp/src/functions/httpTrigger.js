const { app } = require('@azure/functions');
const contentful = require('contentful');
require('dotenv').config();

const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    environment: 'master',
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

app.http('httpTrigger', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (request.method !== 'POST') {
            return {
                status: 405,
                body: 'This endpoint only accepts POST requests.'
            };
        }
        let body;
        try {
            body = await request.text();
            // context.log('Webhook Body:', body);
        } catch (error) {
            return {
                status: 400,
                body: 'Unable to read request body.'
            };
        }
        let payload;
        try {
            payload = JSON.parse(body);
        } catch (error) {
            return {
                status: 400,
                body: 'Invalid JSON format in request body.'
            };
        }
        if (!payload || !payload.fields || !payload.fields.file || !payload.fields.file['en-US'] || !payload.fields.file['en-US'].url) {
            return {
                status: 400,
                body: 'Missing required fields in request body.'
            };
        }
        const imageUrl = `https:${payload.fields.file['en-US'].url}`;
        context.log(`Extracted Image URL: ${imageUrl}`);
        return {
            status: 200,
            body: JSON.stringify({ imageUrl })
        };
    }
});