'use client';
import './style.css';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
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
  X
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  image: string;
  badge: string;
}

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

const navItems: NavItem[] = [
  { label: 'Home', icon: <Globe size={20} />, href: '/' },
  { label: 'About Us', icon: <Info size={20} />, href: '/about' },
  { label: 'Media', icon: <FileText size={20} />, href: '/media' },
  { label: 'Space Community', icon: <Users size={20} />, href: '/community' },
  { label: 'Space Calendar', icon: <Calendar size={20} />, href: '/calendar' },
  { label: 'Contact us', icon: <Mail size={20} />, href: '/contact' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const galleryTrackRef = useRef<HTMLDivElement>(null);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollGallery = (direction: 'prev' | 'next') => {
    if (!galleryTrackRef.current) return;

    const scrollAmount = 400;
    const currentScroll = galleryTrackRef.current.scrollLeft;
    
    galleryTrackRef.current.scrollTo({
      left: direction === 'next' 
        ? currentScroll + scrollAmount 
        : currentScroll - scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <>
    <div className="header-container">
      <Link href="/" className="logo-container">
        {/* Replace '/logo.png' with your actual logo path once you add the image */}
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
    <section className="join-team-section">
  <div className="join-left">
    <h1><span className="highlight">Join</span> Our Team</h1>
    <h2>to make<br />someone's life<br />better</h2>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum enim nobis dolorum maiores repellendus sunt alias officiis blanditiis quisquam. In.</p>
    <button className="join-btn">Join us</button>
  </div>
  <div className="join-right">
    <img src="/earth.gif" alt="Earth Background" className="earth-img" />
  </div>
</section>

<section className="about-section">
  <div className="about-content">
    <div className="about-left">
      <h2 className="about-title">About <span className="highlight">Us</span></h2>
      <p className="about-description">
        We are a passionate team dedicated to making a difference in the world through space exploration and community engagement. Our mission is to inspire, educate, and connect people with the wonders of space.
      </p>
      <div className="about-stats">
        <div className="stat-item">
          <h3>100+</h3>
          <p>Projects</p>
        </div>
        <div className="stat-item">
          <h3>50+</h3>
          <p>Team Members</p>
        </div>
        <div className="stat-item">
          <h3>1000+</h3>
          <p>Community Members</p>
        </div>
      </div>
    </div>
    <div className="about-right">
      <h3 className="director-title">Director</h3>
      <div className="about-image-container">
        <img src="/owner.png" alt="Our Team" className="about-image" />
        <div className="image-overlay"></div>
      </div>
      <h3 className="director-name">Priya Yadav</h3>
    </div>
  </div>
</section>
<section className="event-section">
  <div className="event-content">
    <h2 className="event-title">Our <span className="highlight">Events</span></h2>
    <div className="event-gallery-container">
      <div className="gallery-track" ref={galleryTrackRef}>
        {events.map((event) => (
          <div key={event.id} className="gallery-card">
            <div className="card-content">
              <div className="card-image-wrapper">
                <img src={event.image} alt={event.title} className="gallery-image" />
                <div className="card-badge">{event.badge}</div>
              </div>
              <div className="card-info">
                <span className="card-date">{event.date}</span>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="card-footer">
                  <span className="location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {event.location}
                  </span>
                  <button className="learn-more">Learn More</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="gallery-controls">
        <button className="control-btn prev" onClick={() => scrollGallery('prev')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button className="control-btn next" onClick={() => scrollGallery('next')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</section>
    </>
  );
}
