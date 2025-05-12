import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/ourEvents.json');
const uploadDir = path.join(process.cwd(), 'public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper function to read data
const readData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { events: [] };
  }
};

// Helper function to write data
const writeData = (data: any) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// GET all our events
export async function GET() {
  try {
    const data = readData();
    return NextResponse.json(data.events);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST new our event
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const location = formData.get('location') as string;
    const imageFile = formData.get('image') as File;

    if (!title || !description || !date || !location || !imageFile) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Handle image upload
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${imageFile.name}`;
    const imagePath = `/uploads/${filename}`;
    const fullPath = path.join(uploadDir, filename);

    // Save the file
    fs.writeFileSync(fullPath, buffer);

    const data = readData();
    const newEvent = {
      id: timestamp.toString(),
      title,
      description,
      date,
      image: imagePath,
      location,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.events.push(newEvent);
    writeData(data);

    return NextResponse.json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// PUT update our event
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const location = formData.get('location') as string;
    const imageFile = formData.get('image') as File;

    if (!id || !title || !description || !date || !location) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const data = readData();
    const eventIndex = data.events.findIndex((event: any) => event.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    let imagePath = data.events[eventIndex].image;

    // Handle new image upload if provided
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const timestamp = Date.now();
      const filename = `${timestamp}-${imageFile.name}`;
      imagePath = `/uploads/${filename}`;
      const fullPath = path.join(uploadDir, filename);

      // Save the new file
      fs.writeFileSync(fullPath, buffer);

      // Delete old image if it exists
      const oldImagePath = path.join(process.cwd(), 'public', data.events[eventIndex].image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const updatedEvent = {
      ...data.events[eventIndex],
      title,
      description,
      date,
      image: imagePath,
      location,
      updatedAt: new Date().toISOString()
    };

    data.events[eventIndex] = updatedEvent;
    writeData(data);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE our event
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const data = readData();
    const eventIndex = data.events.findIndex((event: any) => event.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete the associated image
    const imagePath = path.join(process.cwd(), 'public', data.events[eventIndex].image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    data.events.splice(eventIndex, 1);
    writeData(data);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
} 