import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { ContentList } from '@/components/Content/ContentList';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Bundles = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'bundles'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
      } catch (error) {
        console.error('Error fetching bundles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ContentList 
        title="Bundles" 
        items={items} 
        loading={loading}
        type="bundles"
      />
    </div>
  );
};

export default Bundles;
