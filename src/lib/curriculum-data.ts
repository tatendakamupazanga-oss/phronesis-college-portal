export interface CombinationOption {
  id: string;
  category: 'Commercials' | 'Sciences' | 'General';
  title: string;
  subjects: string[];
}

export const O_LEVEL_COMBINATIONS: CombinationOption[] = [
  {
    id: 'o-comm',
    category: 'Commercials',
    title: 'Commercials',
    subjects: ['Mathematics', 'English', 'Shona', 'Heritage', 'Combined Science', 'Computer Science', 'Accounting', 'B.E.S', 'Economics'],
  },
  {
    id: 'o-sci-1',
    category: 'Sciences',
    title: 'Sciences 1',
    subjects: ['Mathematics', 'English', 'Shona', 'Heritage', 'Combined Science', 'Computer Science', 'Physics', 'Chemistry', 'Biology'],
  },
  {
    id: 'o-sci-2',
    category: 'Sciences',
    title: 'Sciences 2',
    subjects: ['Mathematics', 'English', 'Shona', 'Heritage', 'Combined Science', 'Computer Science', 'Geography', 'Chemistry', 'Biology'],
  },
  {
    id: 'o-sci-3',
    category: 'Sciences',
    title: 'Sciences 3',
    subjects: ['Mathematics', 'English', 'Shona', 'Heritage', 'Combined Science', 'Computer Science', 'Physics', 'Chemistry', 'Geography'],
  },
];

export const A_LEVEL_COMBINATIONS: CombinationOption[] = [
  // Sciences
  { id: 'a-sci-1', category: 'Sciences', title: 'Sciences 1', subjects: ['Mathematics', 'Physics', 'Chemistry'] },
  { id: 'a-sci-2', category: 'Sciences', title: 'Sciences 2', subjects: ['Mathematics', 'Physics', 'Computer Science'] },
  { id: 'a-sci-3', category: 'Sciences', title: 'Sciences 3', subjects: ['Mathematics', 'Physics', 'Geography'] },
  { id: 'a-sci-4', category: 'Sciences', title: 'Sciences 4', subjects: ['Mathematics', 'Biology', 'Chemistry'] },
  { id: 'a-sci-5', category: 'Sciences', title: 'Sciences 5', subjects: ['Mathematics', 'Biology', 'Geography'] },
  { id: 'a-sci-6', category: 'Sciences', title: 'Sciences 6', subjects: ['Mathematics', 'Biology', 'Computer Science'] },
  { id: 'a-sci-7', category: 'Sciences', title: 'Sciences 7', subjects: ['Biology', 'Geography', 'Crop Science'] },
  { id: 'a-sci-8', category: 'Sciences', title: 'Sciences 8', subjects: ['Biology', 'Geography', 'Chemistry'] },

  // Commercials
  { id: 'a-comm-1', category: 'Commercials', title: 'Commercials 1', subjects: ['Pure Mathematics', 'Statistics', 'Computer Science'] },
  { id: 'a-comm-2', category: 'Commercials', title: 'Commercials 2', subjects: ['Pure Mathematics', 'Economics', 'Accounting'] },
  { id: 'a-comm-3', category: 'Commercials', title: 'Commercials 3', subjects: ['Pure Mathematics', 'Computer Science', 'Economics'] },
  { id: 'a-comm-4', category: 'Commercials', title: 'Commercials 4', subjects: ['Business Studies', 'Economics', 'Accounting'] },
  { id: 'a-comm-5', category: 'Commercials', title: 'Commercials 5', subjects: ['Pure Mathematics', 'Economics', 'Business Studies'] },
  { id: 'a-comm-6', category: 'Commercials', title: 'Commercials 6', subjects: ['Pure Mathematics', 'Accounting', 'Computer Science'] },
  { id: 'a-comm-7', category: 'Commercials', title: 'Commercials 7', subjects: ['Pure Mathematics', 'Computer Science', 'Business Studies'] },
];