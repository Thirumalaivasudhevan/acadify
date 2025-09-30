import React from 'react';
import NewsWidget from '../../components/dashboard/NewsWidget';
import { Newspaper } from 'lucide-react';

const NewsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-lg bg-accent/20">
          <Newspaper className="h-8 w-8 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Department News</h1>
          <p className="text-muted-foreground">Stay updated with latest department announcements</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <NewsWidget />
      </div>
    </div>
  );
};

export default NewsPage;
