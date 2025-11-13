import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { ContentList } from '@/components/Content/ContentList';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Games = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'games'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ContentList 
        title="Games" 
        items={items} 
        loading={loading}
        type="games"
      />
    </div>
  );
};

export default Games;
