import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { courseCategories } from '@/lib/utils';

const Toolbar = ({ onSearch, onCategoryChange }: ToolbarProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce onSearch by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, 5000);

    return () => clearTimeout(handler);
  }, [searchTerm, onSearch]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="toolbar">
      <input
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search courses"
        className="toolbar__search"
      />
      <Select onValueChange={onCategoryChange}>
        <SelectTrigger className="toolbar__select">
          <SelectValue placeholder="Categories" />
        </SelectTrigger>
        <SelectContent className="bg-customgreys-primarybg hover:bg-customgreys-primarybg">
          <SelectItem value="all" className="toolbar__select-item">
            All Categories
          </SelectItem>
          {courseCategories.map((category) => (
            <SelectItem
              key={category.value}
              value={category.value}
              className="toolbar__select-item"
            >
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Toolbar;
