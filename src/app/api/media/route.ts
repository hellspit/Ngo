import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/mediaEvents.json');

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

// GET all media events
export async function GET() {
  try {
    const data = readData();
    return NextResponse.json(data.events);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST new media event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, date, image, location } = body;

    const data = readData();
    const newEvent = {
      id: Date.now().toString(), // Simple ID generation
      title,
      description,
      date,
      image,
      location,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.events.push(newEvent);
    writeData(data);

    return NextResponse.json(newEvent);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// PUT update media event
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, date, image, location } = body;

    const data = readData();
    const eventIndex = data.events.findIndex((event: any) => event.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updatedEvent = {
      ...data.events[eventIndex],
      title,
      description,
      date,
      image,
      location,
      updatedAt: new Date().toISOString()
    };

    data.events[eventIndex] = updatedEvent;
    writeData(data);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE media event
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

    data.events.splice(eventIndex, 1);
    writeData(data);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
} 