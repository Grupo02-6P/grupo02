export interface SidebarSection {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SidebarProps {
  title: string;
  description?: string;
  sections: SidebarSection[];
  selected: string;
  onSelect: (section: string) => void;
  className?: string;
  width?: 'sm' | 'md' | 'lg';
}
