'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './style.css';
import {
  Globe,
  Info,
  FileText,
  Users,
  Calendar,
  Mail,
  Menu,
  X,
  Trash2,
  Edit,
  Plus,
  Save,
  Search,
  Image as ImageIcon,
  Camera,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface Member {
  id: string;
  name: string;
  position: string;
  age: number;
  photo: string;
  bio: string;
}

const navItems: NavItem[] = [
  { label: 'Home', icon: <Globe size={20} />, href: '/' },
  { label: 'About Us', icon: <Info size={20} />, href: '/about' },
  { label: 'Media', icon: <FileText size={20} />, href: '/media' },
  { label: 'Members', icon: <Users size={20} />, href: '/member' },
  { label: 'Calendar', icon: <Calendar size={20} />, href: '/calendar' },
  { label: 'Contact us', icon: <Mail size={20} />, href: '/contact' },
];

export default function MemberControlPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New member form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState<Partial<Member>>({
    name: '',
    position: '',
    age: 25,
    photo: '/default-profile.jpg',
    bio: ''
  });
  
  // Edit member state
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Flashcard states
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch members from API
  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/members');
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Error loading members. Please try again later.');
      console.error('Error fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load members on initial render
  useEffect(() => {
    fetchMembers();
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Filter members based on search term
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle new member form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMember({
      ...newMember,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    });
  };
  
  // Handle edit member form input changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingMember) return;
    
    const { name, value } = e.target;
    setEditingMember({
      ...editingMember,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    });
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    
    // In a real application, you would upload this file to a server
    // For now, we'll just use the preview URL as the photo URL
    setNewMember({
      ...newMember,
      photo: objectUrl
    });
  };
  
  // Add a new member
  const handleAddMember = async () => {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add member');
      }
      
      // Reset form and refresh members list
      setNewMember({
        name: '',
        position: '',
        age: 25,
        photo: '/default-profile.jpg',
        bio: ''
      });
      setShowFlashcard(false);
      setCurrentStep(0);
      setPreviewImage(null);
      fetchMembers();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Error adding member:', err);
    }
  };
  
  // Delete a member
  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete member');
      }
      
      fetchMembers();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Error deleting member:', err);
    }
  };
  
  // Start editing a member
  const handleEditMember = (member: Member) => {
    setEditingMember(member);
  };
  
  // Save edits to a member
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMember) return;
    
    try {
      const response = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingMember),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update member');
      }
      
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Error updating member:', err);
    }
  };
  
  // Handle next and previous in flashcard steps
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit the form on the last step
      handleAddMember();
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setShowFlashcard(false);
    }
  };
  
  // Open file dialog
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Render the current flashcard step
  const renderFlashcardStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flashcard-step">
            <h3>Upload Photo</h3>
            <div 
              className="image-upload-area"
              onClick={triggerFileInput}
            >
              {previewImage ? (
                <div className="preview-container">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="image-preview" 
                  />
                </div>
              ) : (
                <div className="upload-placeholder">
                  <Camera size={48} />
                  <p>Click to upload photo</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden-file-input"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flashcard-step">
            <h3>Basic Information</h3>
            <div className="flashcard-form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newMember.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="flashcard-form-group">
              <label htmlFor="position">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={newMember.position}
                onChange={handleInputChange}
                placeholder="Enter position/role"
                required
              />
            </div>
            
            <div className="flashcard-form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                min="18"
                max="100"
                value={newMember.age}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flashcard-step">
            <h3>Bio</h3>
            <div className="flashcard-form-group">
              <label htmlFor="bio">Professional Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={newMember.bio}
                onChange={handleInputChange}
                placeholder="Write a brief professional bio..."
                required
                rows={6}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flashcard-step">
            <h3>Preview</h3>
            <div className="member-preview">
              <div className="preview-photo">
                <img 
                  src={previewImage || newMember.photo} 
                  alt={newMember.name || "New member"} 
                />
              </div>
              <div className="preview-info">
                <h4>{newMember.name || "Name"}</h4>
                <p className="preview-position">{newMember.position || "Position"}</p>
                <div className="preview-details">
                  <span className="preview-age">
                    <strong>Age:</strong> {newMember.age}
                  </span>
                </div>
                <p className="preview-bio">{newMember.bio || "Bio will appear here"}</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <main className="main-content">
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

      <div className="member-control-content">
        <div className="section-title-container">
          <h2>Member <span className="highlight">Management</span></h2>
          <button 
            className="add-member-btn"
            onClick={() => setShowFlashcard(true)}
          >
            Add New Member
            <Plus size={20} />
          </button>
        </div>
        
        {error && (
          <div className="error-alert">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        {/* Flashcard Form */}
        {showFlashcard && (
          <div className="flashcard-overlay">
            <div className="flashcard-container">
              <button className="flashcard-close-btn" onClick={() => setShowFlashcard(false)}>
                <X size={24} />
              </button>
              
              <div className="flashcard-progress">
                {[0, 1, 2, 3].map(step => (
                  <div 
                    key={step} 
                    className={`progress-dot ${currentStep >= step ? 'active' : ''}`}
                    onClick={() => setCurrentStep(step)}
                  />
                ))}
              </div>
              
              {renderFlashcardStep()}
              
              <div className="flashcard-actions">
                <button 
                  className="flashcard-prev-btn" 
                  onClick={handlePrevStep}
                >
                  <ArrowLeft size={20} />
                  {currentStep === 0 ? 'Cancel' : 'Back'}
                </button>
                
                <button 
                  className="flashcard-next-btn" 
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 0 && !previewImage) ||
                    (currentStep === 1 && (!newMember.name || !newMember.position)) ||
                    (currentStep === 2 && !newMember.bio)
                  }
                >
                  {currentStep < 3 ? (
                    <>
                      Next
                      <ArrowRight size={20} />
                    </>
                  ) : (
                    <>
                      Add Member
                      <Check size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Member Form */}
        {editingMember && (
          <div className="form-container edit-form">
            <h3>Edit Member</h3>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label htmlFor="edit-name">Name</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editingMember.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-position">Position</label>
                <input
                  type="text"
                  id="edit-position"
                  name="position"
                  value={editingMember.position}
                  onChange={handleEditChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-age">Age</label>
                <input
                  type="number"
                  id="edit-age"
                  name="age"
                  min="18"
                  max="100"
                  value={editingMember.age}
                  onChange={handleEditChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-photo">Photo URL</label>
                <input
                  type="text"
                  id="edit-photo"
                  name="photo"
                  value={editingMember.photo}
                  onChange={handleEditChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-bio">Bio</label>
                <textarea
                  id="edit-bio"
                  name="bio"
                  value={editingMember.bio}
                  onChange={handleEditChange}
                  required
                  rows={4}
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  <Save size={18} />
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setEditingMember(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search members..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading">Loading members...</div>
        ) : (
          <div className="members-table">
            <table>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Age</th>
                  <th>Bio</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map(member => (
                    <tr key={member.id}>
                      <td>
                        <div className="member-photo-small">
                          <img src={member.photo} alt={member.name} />
                        </div>
                      </td>
                      <td>{member.name}</td>
                      <td>{member.position}</td>
                      <td>{member.age}</td>
                      <td className="bio-cell">{member.bio}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditMember(member)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="no-results">
                      No members found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
