

export type FeatherIconName = 'aperture' | 'hash' | 'star' | 'message-circle' | 'activity' | 'compass' | 'book-open' | 'globe';

export interface SubjectConfig {
  id: string;
  name: string;
  description: string;
  icon: FeatherIconName;
  color: string;
  bgColor: string;
  topics: string[];
}

export const SUBJECT_REGISTRY: Record<string, SubjectConfig> = {
  physics: {
    id: 'physics',
    name: 'Physics',
    description: 'Mechanics, electromagnetism, and quantum dynamics.',
    icon: 'aperture',
    color: '#185B37', 
    bgColor: '#E6F0EB',
    topics: [
      'Classical Mechanics', 
      'Quantum Mechanics', 
      'Electromagnetism', 
      'Statistical Physics', 
      'Condensed Matter', 
      'General Relativity', 
      'Optics', 
      'Quantum Field Theory', 
      'Other topics'
    ]
  },
  mathematics: {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Proofs, Olympiad logic, and symbolic derivations.',
    icon: 'hash',
    color: '#2563EB', 
    bgColor: '#EFF6FF',
    topics: [] 
  },
  astronomy: {
    id: 'astronomy',
    name: 'Astronomy & Astrophysics',
    description: 'Orbital mechanics, stellar evolution, and cosmology.',
    icon: 'star',
    color: '#7C3AED', 
    bgColor: '#F5F3FF',
    topics: []
  },
  linguistics: {
    id: 'linguistics',
    name: 'Linguistics',
    description: 'Formal grammar, phonology, and syntax parsing.',
    icon: 'message-circle',
    color: '#D97706', 
    bgColor: '#FFFBEB',
    topics: []
  }
};

export const SUBJECT_LIST = Object.values(SUBJECT_REGISTRY);