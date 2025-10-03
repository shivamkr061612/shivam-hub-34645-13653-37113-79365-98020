import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { ContentList } from '@/components/Content/ContentList';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Mods = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMods = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'mods'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
      } catch (error) {
        console.error('Error fetching mods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMods();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ContentList 
        title="Mods" 
        items={items} 
        loading={loading}
        type="mods"
      />
    </div>
  );
};

export default Mods;
