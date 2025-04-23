'use client';
import { useState, useEffect } from 'react';
import './style.css';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  image: string;
  badge: string;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await fetch('/api/events', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: eventId }),
        });
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const url = '/api/events';
      const method = selectedEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData,
      });
      
      if (response.ok) {
        fetchEvents();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Event Management</h1>
        <button className="add-event-btn" onClick={handleAddEvent}>
          Add New Event
        </button>
      </div>

      <div className="events-grid">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <img src={event.image} alt={event.title} className="event-image" />
            <div className="event-details">
              <h3>{event.title}</h3>
              <p>{event.date}</p>
              <p>{event.location}</p>
              <div className="event-actions">
                <button onClick={() => handleEditEvent(event)}>Edit</button>
                <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <EventModal 
          event={selectedEvent}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

function EventModal({ 
  event, 
  onSubmit, 
  onClose 
}: { 
  event: Event | null;
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date || '',
    description: event?.description || '',
    location: event?.location || '',
    badge: event?.badge || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataObj = new FormData();
    formDataObj.append('id', event?.id || '');
    formDataObj.append('title', formData.title);
    formDataObj.append('date', formData.date);
    formDataObj.append('description', formData.description);
    formDataObj.append('location', formData.location);
    formDataObj.append('badge', formData.badge);
    
    // Add image file if selected
    const imageInput = document.getElementById('image') as HTMLInputElement;
    if (imageInput?.files?.[0]) {
      formDataObj.append('image', imageInput.files[0]);
    }
    
    onSubmit(formDataObj);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{event ? 'Edit Event' : 'Add New Event'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              required={!event}
            />
            {event && (
              <div className="current-image">
                <p>Current Image:</p>
                <img src={event.image} alt="Current" style={{ maxWidth: '200px' }} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="badge">Badge</label>
            <select
              id="badge"
              value={formData.badge}
              onChange={e => setFormData({ ...formData, badge: e.target.value })}
              required
            >
              <option value="">Select a badge</option>
              <option value="Featured">Featured</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Popular">Popular</option>
              <option value="Limited">Limited</option>
              <option value="New">New</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="submit">{event ? 'Update' : 'Add'} Event</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}