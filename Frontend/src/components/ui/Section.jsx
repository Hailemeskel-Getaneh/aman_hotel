import React from 'react';
import { cn } from '../../lib/utils';

const Section = ({ className, children, id, ...props }) => {
    return (
        <section
            id={id}
            className={cn("py-16 md:py-24", className)}
            {...props}
        >
            <div className="container mx-auto px-4 md:px-6">
                {children}
            </div>
        </section>
    );
};

export default Section;
