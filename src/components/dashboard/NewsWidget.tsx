import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Newspaper, ExternalLink, Calendar } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  published_date: string;
  department_id: string;
}

const NewsWidget: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDepartmentNews();
    }
  }, [user]);

  const loadDepartmentNews = async () => {
    try {
      setLoading(true);

      // Get user's department from student profile
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('department')
        .eq('user_id', user?.id)
        .single();

      if (!studentProfile?.department) {
        toast({
          title: "Profile incomplete",
          description: "Please complete your student profile to view department news.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Get latest news for user's department
      const { data: newsData, error } = await supabase
        .from('department_news')
        .select('*')
        .eq('department_id', getDepartmentId(studentProfile.department))
        .order('published_date', { ascending: false })
        .limit(3);

      if (error) throw error;

      setNews(newsData || []);
    } catch (error) {
      console.error('Error loading news:', error);
      toast({
        title: "Error",
        description: "Failed to load department news. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentId = (department: string): string => {
    const deptMap: { [key: string]: string } = {
      'Computer Science': '1',
      'Electronics': '2',
      'Mechanical': '3',
      'Civil': '4',
      'BBA': '5'
    };
    return deptMap[department] || '1';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="card-luxury hover-lift">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Department News</CardTitle>
              <CardDescription>Latest updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-2 w-1/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-luxury hover-lift">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Department News</CardTitle>
            <CardDescription>Latest updates from your department</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {news.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-muted-foreground mb-4">
              No news available for your department.
            </div>
            <Button onClick={loadDepartmentNews} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        ) : (
          <>
            {news.map((item) => (
              <div key={item.id} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm leading-tight flex-1 pr-2">
                    {item.title}
                  </h4>
                  <Badge variant="outline" className="text-xs shrink-0">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(item.published_date)}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                {item.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    Read More
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            ))}
            
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" className="text-xs">
                See All News
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsWidget;