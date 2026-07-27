export type UserRole = 'admin' | 'professional' | 'client';
export type UserStatus = 'pending' | 'active' | 'rejected';

export interface PlaceResult {
  lat: number;
  lng: number;
  address: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  specialty?: string;
  address?: string;
  lat?: number;
  lng?: number;
  church?: string;
  yearsLinked?: number;
  referenceName?: string;
  referencePhone?: string;
  agreedToEthics?: boolean;
  hours?: string;
  modality?: string; // A domicilio / Taller propio
  coverageRadius?: number; // km
  rating?: number;
  reviewCount?: number;
  portfolio?: string[]; // array of image urls
  bannerURL?: string;
  beforeAfterProjects?: BeforeAfterProject[];
  videoURL?: string;
}

export interface BeforeAfterProject {
  id: string;
  title: string;
  beforeURL: string;
  afterURL: string;
  createdAt: string;
}

export interface Review {
  id?: string;
  professionalId: string;
  reviewerId: string;
  reviewerName: string;
  technicalScore: number;
  punctualityScore: number;
  respectScore: number;
  overallScore: number;
  comment: string;
  createdAt: any; // Timestamp
}
