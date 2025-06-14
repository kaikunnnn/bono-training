// Training専用UIコンポーネントの型定義

export interface TrainingButtonProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  asChild?: boolean;
}

export interface TrainingCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
}

export interface TrainingBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export interface TrainingInputProps extends React.ComponentProps<'input'> {
  className?: string;
}

export interface TrainingSelectProps {
  children: React.ReactNode;
  className?: string;
}

export interface TrainingCheckboxProps extends React.ComponentPropsWithoutRef<'input'> {
  className?: string;
}

export interface TrainingFormProps {
  children: React.ReactNode;
  className?: string;
}