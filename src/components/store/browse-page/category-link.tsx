import React from 'react';

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface CategoryLinkProps {
  categories?: Category[]; // Make categories optional
}

function CategoryLink({ categories = [] }: CategoryLinkProps) { // Add default value
  if (categories.length === 0) {
    return null; // Return null if categories is empty
  }

  return (
    <div>
      {categories.map((category) => (
        <a key={category.id} href={`/category/${category.slug}`}>
          {category.name}
        </a>
      ))}
    </div>
  );
}

export default CategoryLink;
