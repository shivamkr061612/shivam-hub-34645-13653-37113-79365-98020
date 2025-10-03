import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { ContentList } from '@/components/Content/ContentList';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Courses = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
