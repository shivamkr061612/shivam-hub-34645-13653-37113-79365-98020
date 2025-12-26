import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { ContentList } from '@/components/Content/ContentList';
import { SectionBlocker } from '@/components/Section/SectionBlocker';
import { useSectionAccess } from '@/hooks/useSectionAccess';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

const Courses = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { loading: accessLoading, isLocked, isPremium } = useSectionAccess('courses');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'courses'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isLocked || isPremium) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <SectionBlocker sectionName="Courses" isLocked={isLocked} isPremium={isPremium} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ContentList 
        title="Courses" 
        items={items} 
        loading={loading}
        type="courses"
      />
    </div>
  );
};

export default Courses;
