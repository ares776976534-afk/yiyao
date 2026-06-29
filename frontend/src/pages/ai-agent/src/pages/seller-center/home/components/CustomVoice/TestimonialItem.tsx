import React from 'react';
import { StarYellowIcon } from '@/components/Icon';
import styles from './index.module.scss';
import type { TypeTestimonialData } from './types';

interface TypeTestimonialItemProps {
  testimonial: TypeTestimonialData;
}

const TestimonialItem: React.FC<TypeTestimonialItemProps> = ({ testimonial }) => {
  return (
    <div className={styles.testimonialItem}>
      <div className="flex justify-between">
        <div>
          <div className="flex gap-2">
            <StarYellowIcon />
            <StarYellowIcon />
            <StarYellowIcon />
            <StarYellowIcon />
            <StarYellowIcon />
          </div>
          <p className={styles.authorName}>{testimonial.author.name}</p>
          <p className={styles.authorTitle}>{testimonial.author.title}</p>
        </div>
        <img
          className={styles.authorAvatar}
          src={testimonial.author.avatar}
          alt={testimonial.author.name}
        />
      </div>
      <p className={styles.text}>{testimonial.text}</p>
    </div>
  );
};

export default TestimonialItem;


