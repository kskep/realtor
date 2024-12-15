import { prisma } from '$lib/prisma';



export async function post({ request }: { request: Request }) {
  const data = await request.json();

  try {
    const newProperty = await prisma.property.create({
      data: {
        title: data.title,
        location: data.location,
        price: data.price,
        status: data.status,
        description: data.description,
        type: data.type
      }
    });

    return {
      status: 201,
      body: newProperty
    };
  } catch (error) {
    console.error('Error adding property:', error);
    return {
      status: 500,
      body: { error: 'Failed to add property' }
    };
  }
}