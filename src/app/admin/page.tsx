'use client';
import './style.css';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, ReactElement, useEffect, useRef } from 'react';
import {
  Globe,
  Info,
  Wrench,
  Megaphone,
  FileText,
  Users,
  Calendar,
  Mail,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: ReactElement;
  href: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  location: string;
}

const navItems: NavItem[] = [
  { label: 'Home', icon: <Globe size={20} />, href: '/' },
  { label: 'About Us', icon: <Info size={20} />, href: '/AboutUs' },
  { label: 'Media', icon: <FileText size={20} />, href: '/media' },
  { label: 'Space Community', icon: <Users size={20} />, href: '/community' },
  { label: 'Space Calendar', icon: <Calendar size={20} />, href: '/calendar' },
  { label: 'Contact us', icon: <Mail size={20} />, href: '/contact' },
];

export default function AdminPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [ourEvents, setOurEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    image: null as File | null,
    location: '',
  });
  const [message, setMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; eventId: string | null; type: 'regular' | 'our' }>({
    show: false,
    eventId: null,
    type: 'regular'
  });
  const eventsContainerRef = useRef<HTMLDivElement>(null);
  const ourEventsContainerRef = useRef<HTMLDivElement>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showOurEventForm, setShowOurEventForm] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchOurEvents();
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

  const fetchOurEvents = async () => {
    try {
      const response = await fetch('/api/ourEvents');
      const data = await response.json();
      setOurEvents(data);
    } catch (error) {
      console.error('Error fetching our events:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string, type: 'regular' | 'our') => {
    try {
      const endpoint = type === 'regular' ? '/api/events' : '/api/ourEvents';
      const response = await fetch(`${endpoint}?id=${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      if (type === 'regular') {
        setEvents(prev => prev.filter(event => event.id !== eventId));
      } else {
        setOurEvents(prev => prev.filter(event => event.id !== eventId));
      }
      setMessage('Event deleted successfully!');
    } catch (error) {
      setMessage('Error deleting event. Please try again.');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file');
        e.target.value = ''; // Clear the file input
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size should be less than 5MB');
        e.target.value = ''; // Clear the file input
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setMessage(''); // Clear any error messages
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear any previous messages

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.date || !formData.location || !formData.image) {
        setMessage('All fields are required');
        return;
      }

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('location', formData.location);
      
      // Validate and append image
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      } else {
        setMessage('Please select a valid image file');
        return;
      }

      // Send request
      const response = await fetch('/api/events', {
        method: 'POST',
        body: formDataToSend,
      });

      // Handle response
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create event');
      }

      // Update state on success
      setEvents(prev => [...prev, responseData]);
      setFormData({
        title: '',
        description: '',
        date: '',
        image: null,
        location: '',
      });
      setMessage('Event created successfully!');
      setShowEventForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
      setMessage(error instanceof Error ? error.message : 'Error creating event. Please try again.');
    }
  };

  const handleOurEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear any previous messages

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.date || !formData.location || !formData.image) {
        setMessage('All fields are required');
        return;
      }

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('location', formData.location);
      
      // Validate and append image
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      } else {
        setMessage('Please select a valid image file');
        return;
      }

      // Send request
      const response = await fetch('/api/ourEvents', {
        method: 'POST',
        body: formDataToSend,
      });

      // Handle response
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create event');
      }

      // Update state on success
      setOurEvents(prev => [...prev, responseData]);
      setFormData({
        title: '',
        description: '',
        date: '',
        image: null,
        location: '',
      });
      setMessage('Our Event created successfully!');
      setShowOurEventForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
      setMessage(error instanceof Error ? error.message : 'Error creating event. Please try again.');
    }
  };

  const handleDeleteClick = (eventId: string, type: 'regular' | 'our') => {
    setDeleteConfirmation({
      show: true,
      eventId,
      type
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.eventId) {
      await handleDeleteEvent(deleteConfirmation.eventId, deleteConfirmation.type);
      setDeleteConfirmation({
        show: false,
        eventId: null,
        type: 'regular'
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      show: false,
      eventId: null,
      type: 'regular'
    });
  };

  const scrollEvents = (direction: 'left' | 'right') => {
    if (eventsContainerRef.current) {
      const container = eventsContainerRef.current;
      const scrollAmount = 320; // card width + gap
      const scrollPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const filteredOurEvents = ourEvents.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="header-container">
        <Link href="/" className="logo-container">
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="logo-image"
          />
        </Link>

        <nav className="navbar">
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className={`nav-items ${isMenuOpen ? 'show' : ''}`}>
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.href} 
                className="nav-item"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="nav-icon">{item.icon}</div>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
        </div>
        
        <div className="events-list">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <button 
              className="add-event-btn"
              onClick={() => setShowEventForm(!showEventForm)}
            >
              {showEventForm ? (
                <>
                  <X size={20} />
                  <span>Close Form</span>
                </>
              ) : (
                <>
                  <Plus size={20} />
                  <span>Add Upcoming Event</span>
                </>
              )}
            </button>
          </div>
          <div className="events-container">
            <button 
              className="nav-button prev"
              onClick={() => scrollEvents('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft />
            </button>
            <div className="events-grid" ref={eventsContainerRef}>
              {events.map(event => (
                <div key={event.id} className="event-card">
                  <img src={event.image} alt={event.title} className="event-image" />
                  <div className="event-details">
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                    <div className="event-date">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="event-location">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {event.location}
                    </div>
                    <button 
                      onClick={() => handleDeleteClick(event.id, 'regular')} 
                      className="delete-btn"
                    >
                      Delete Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="nav-button next"
              onClick={() => scrollEvents('right')}
              aria-label="Scroll right"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        <div className="events-list">
          <div className="section-header">
            <div className="section-title-container">
              <h2>Our Events</h2>
              <div className="search-container">
                {isSearchExpanded ? (
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                      autoFocus
                    />
                    <button 
                      className="close-search-btn"
                      onClick={() => {
                        setIsSearchExpanded(false);
                        setSearchQuery('');
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    className="search-toggle-btn"
                    onClick={() => setIsSearchExpanded(true)}
                    aria-label="Search events"
                  >
                    <Search size={18} />
                  </button>
                )}
              </div>
            </div>
            <button 
              className="add-event-btn"
              onClick={() => setShowOurEventForm(!showOurEventForm)}
            >
              {showOurEventForm ? (
                <>
                  <X size={20} />
                  <span>Close Form</span>
                </>
              ) : (
                <>
                  <Plus size={20} />
                  <span>Add Our Event</span>
                </>
              )}
            </button>
          </div>
          <div className="events-container">
            <button 
              className="nav-button prev"
              onClick={() => scrollEvents('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft />
            </button>
            <div className="events-grid" ref={ourEventsContainerRef}>
              {filteredOurEvents.map(event => (
                <div key={event.id} className="event-card">
                  <img src={event.image} alt={event.title} className="event-image" />
                  <div className="event-details">
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                    <div className="event-date">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="event-location">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {event.location}
                    </div>
                    <button 
                      onClick={() => handleDeleteClick(event.id, 'our')} 
                      className="delete-btn"
                    >
                      Delete Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="nav-button next"
              onClick={() => scrollEvents('right')}
              aria-label="Scroll right"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        {showEventForm && (
          <div className="modal-overlay">
            <div className="event-form-container">
              <div className="form-header">
                <h2>Create New Upcoming Event</h2>
                <button 
                  className="close-form-btn"
                  onClick={() => setShowEventForm(false)}
                >
                  <X size={24} />
                </button>
              </div>
              {message && <div className="message">{message}</div>}
              
              <form onSubmit={handleSubmit} className="event-form">
                <div className="form-group">
                  <label htmlFor="title">Event Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image">Event Image</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="file-input"
                  />
                  {formData.image && (
                    <p className="file-name">{formData.image.name}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">Create Upcoming Event</button>
              </form>
            </div>
          </div>
        )}

        {showOurEventForm && (
          <div className="modal-overlay">
            <div className="event-form-container">
              <div className="form-header">
                <h2>Create New Our Event</h2>
                <button 
                  className="close-form-btn"
                  onClick={() => setShowOurEventForm(false)}
                >
                  <X size={24} />
                </button>
              </div>
              {message && <div className="message">{message}</div>}
              
              <form onSubmit={handleOurEventSubmit} className="event-form">
                <div className="form-group">
                  <label htmlFor="title">Event Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image">Event Image</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="file-input"
                  />
                  {formData.image && (
                    <p className="file-name">{formData.image.name}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">Create Our Event</button>
              </form>
            </div>
          </div>
        )}

        {deleteConfirmation.show && (
          <div className="delete-confirmation">
            <h3>Are you sure you want to delete this event?</h3>
            <p>This action cannot be undone.</p>
            <div className="delete-confirmation-buttons">
              <button 
                className="confirm-delete"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
              <button 
                className="cancel-delete"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
