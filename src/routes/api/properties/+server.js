import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST({ request }) {
    try {
        const data = await request.json();

        // Convert string values to numbers where needed
        const propertyData = {
            ...data,
            price: parseFloat(data.price),
            bedrooms: parseInt(data.bedrooms),
            bathrooms: parseInt(data.bathrooms),
            size: parseFloat(data.size)
        };

        const newProperty = await prisma.property.create({
            data: propertyData
        });

        return json(newProperty);
    } catch (error) {
        console.error('Error creating property:', error);
        return json({ error: 'Failed to create property' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const properties = await prisma.property.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return json(properties);
    } catch (error) {
        console.error('Error fetching properties:', error);
        return json({ error: 'Failed to fetch properties' }, { status: 500 });
    }
}