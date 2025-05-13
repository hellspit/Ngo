'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import './style.css';

interface Member {
  id: string;
  name: string;
  position: string;
  age: number;
  photo: string;
  bio: string;
}

export default function MemberDetailPage() {
  const params = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await fetch(`/api/members/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch member details');
        }
        const data = await response.json();
        setMember(data);
        setError(null);
      } catch (err) {
        setError('Error loading member details. Please try again later.');
        console.error('Error fetching member:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchMember();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="member-detail-content">
          <div className="loading">Loading member details...</div>
        </div>
      </main>
    );
  }

  if (error || !member) {
    return (
      <main className="main-content">
        <div className="member-detail-content">
          <div className="error-alert">
            <p>{error || 'Member not found'}</p>
            <Link href="/community" className="back-button">
              <ArrowLeft size={20} />
              Back to Members
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="member-detail-content">
        <Link href="/community" className="back-button">
          <ArrowLeft size={20} />
          Back to Members
        </Link>

        <div className="member-detail-card">
          <div className="member-image-container">
            <Image
              src={member.photo}
              alt={member.name}
              fill
              className="member-detail-image"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          <div className="member-info">
            <h1>{member.name}</h1>
            <h2>{member.position}</h2>

            <div className="member-stats">
              <div className="stat">
                <span className="stat-label">Age</span>
                <span className="stat-value">{member.age}</span>
              </div>
            </div>

            <div className="member-bio">
              <h3>About</h3>
              <p>{member.bio}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 